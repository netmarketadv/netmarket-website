<?php
// In-memory WordPress adapter for local migration tests. NEVER a live CMS or a release artifact.
declare(strict_types=1);

const ARRAY_A = 'ARRAY_A';
#[\AllowDynamicProperties]
class WP_Post
{
    public function __construct(array $values) { foreach ($values as $key => $value) { $this->$key = $value; } }
}
class WP_Term extends WP_Post {}
$GLOBALS['simPosts'] = [];
$GLOBALS['simMeta'] = [];
$GLOBALS['simTerms'] = [];
$GLOBALS['simRelations'] = [];
$GLOBALS['simNext'] = 50000;
$GLOBALS['simUploads'] = $argv[3];
umask(0077);
function get_option($key) { return $key === 'siteurl' ? 'https://cms.netmarket.it' : ''; }
function get_post_stati() { return array_fill_keys(['publish','draft','private','trash','inherit'], true); }
function get_post_types() { return array_fill_keys(['post','attachment','nm_service','nm_case_study','nm_client'], true); }
function post_type_exists($type) { return isset(get_post_types()[$type]); }
function taxonomy_exists($type) { return in_array($type, ['nm_sector','nm_capability','nm_technology'], true); }
function get_posts($args) {
    $result = array_values(array_filter($GLOBALS['simPosts'], static function ($post) use ($args) {
        if (isset($args['post_type']) && $args['post_type'] !== 'any' && !in_array($post->post_type, (array)$args['post_type'], true)) return false;
        if (isset($args['name']) && $args['name'] !== $post->post_name) return false;
        if (isset($args['post__not_in']) && in_array($post->ID, $args['post__not_in'], true)) return false;
        if (isset($args['post__in']) && !in_array($post->ID, $args['post__in'], true)) return false;
        if (isset($args['meta_key']) && get_post_meta($post->ID, $args['meta_key'], true) != ($args['meta_value'] ?? '')) return false;
        return true;
    }));
    if (($args['orderby'] ?? '') === 'post__in') {
        usort($result, fn ($a, $b) => array_search($a->ID, $args['post__in'], true) <=> array_search($b->ID, $args['post__in'], true));
    }
    return $result;
}
function get_post($id, $output = '') { $p=$GLOBALS['simPosts'][$id] ?? null; return $output === ARRAY_A && $p ? (array)$p : $p; }
function get_post_type($id) { return get_post($id)?->post_type; }
function get_post_status($id) { return get_post($id)?->post_status; }
function get_post_meta($id, $key = '', $single = false) {
    if ($key === '') return $GLOBALS['simMeta'][$id] ?? [];
    $values=$GLOBALS['simMeta'][$id][$key] ?? [];
    return $single ? ($values[0] ?? '') : $values;
}
function update_post_meta($id, $key, $value) { $GLOBALS['simMeta'][$id][$key] = [$value]; return true; }
function add_post_meta($id, $key, $value) { $GLOBALS['simMeta'][$id][$key][] = $value; return true; }
function delete_post_meta($id, $key) { unset($GLOBALS['simMeta'][$id][$key]); return true; }
function wp_insert_post($values, $error = false) {
    $id=++$GLOBALS['simNext']; $meta=$values['meta_input'] ?? []; unset($values['meta_input']);
    $post = new WP_Post(['ID'=>$id,'post_type'=>'post','post_status'=>'draft','post_name'=>'','post_title'=>'','post_content'=>'','post_excerpt'=>'','post_mime_type'=>'']);
    foreach ($values as $key=>$value) $post->$key=$value;
    $GLOBALS['simPosts'][$id]=$post;
    foreach ($meta as $key=>$value) update_post_meta($id,$key,$value);
    return $id;
}
function wp_update_post($values, $error=false) { if (($GLOBALS['simFailPublish'] ?? false) && ($values['post_status'] ?? '') === 'publish') throw new RuntimeException('Injected publication failure'); $id=$values['ID']; foreach ($values as $key=>$value) $GLOBALS['simPosts'][$id]->$key=$value; return $id; }
function wp_insert_attachment($values,$file,$parent=0,$error=false) { $values['post_type']='attachment'; $id=wp_insert_post($values); update_post_meta($id,'_wp_attached_file',$file); return $id; }
function wp_delete_post($id,$force=false) { unset($GLOBALS['simPosts'][$id],$GLOBALS['simMeta'][$id],$GLOBALS['simRelations'][$id]); return true; }
function wp_delete_attachment($id,$force=false) { $file=get_attached_file($id); if (is_file($file)) unlink($file); return wp_delete_post($id,true); }
function wp_upload_dir() { return ['path'=>$GLOBALS['simUploads'],'error'=>false]; }
function wp_unique_filename($dir,$name) { if (file_exists($dir.'/'.$name)) throw new RuntimeException('Simulated duplicate upload'); return $name; }
function get_attached_file($id) { return get_post_meta($id,'_wp_attached_file',true); }
function wp_get_attachment_url($id) { return 'https://cms.netmarket.it/wp-content/uploads/test/'.basename(get_attached_file($id)); }
function wp_get_image_mime($file) { return (new finfo(FILEINFO_MIME_TYPE))->file($file); }
function wp_generate_attachment_metadata($id,$file) { if (str_ends_with($file,'.svg')) return []; $info=getimagesize($file);return ['width'=>$info[0],'height'=>$info[1]]; }
function wp_update_attachment_metadata($id,$meta) { update_post_meta($id,'_wp_attachment_metadata',$meta); }
function wp_get_attachment_metadata($id) { return get_post_meta($id,'_wp_attachment_metadata',true); }
function get_post_mime_type($id) { return get_post($id)?->post_mime_type; }
function wp_get_attachment_image_srcset($id) { return false; }
function wp_get_attachment_image_sizes($id) { return false; }
function get_post_thumbnail_id($id) { return (int)get_post_meta($id,'_thumbnail_id',true); }
function set_post_thumbnail($id,$mediaId) { return update_post_meta($id,'_thumbnail_id',$mediaId); }
function get_the_title($post) { return is_object($post) ? $post->post_title : get_post($post)->post_title; }
function get_the_excerpt($post) { return $post->post_excerpt; }
function get_object_taxonomies($type) { return $type === 'attachment' ? [] : ['nm_sector','nm_capability','nm_technology']; }
function wp_get_object_terms($id,$taxonomy,$args=[]) { return $GLOBALS['simRelations'][$id][$taxonomy] ?? []; }
function get_the_terms($id,$taxonomy) { return array_map(fn($id)=>new WP_Term($GLOBALS['simTerms'][$taxonomy][$id]), wp_get_object_terms($id,$taxonomy)); }
function get_term_by($field,$value,$taxonomy) { foreach ($GLOBALS['simTerms'][$taxonomy] ?? [] as $term) { if ($term[$field] === $value) return (object)$term; } return false; }
function wp_insert_term($name,$taxonomy,$args) { $id=++$GLOBALS['simNext'];$GLOBALS['simTerms'][$taxonomy][$id]=['term_id'=>$id,'name'=>$name,'slug'=>$args['slug'],'taxonomy'=>$taxonomy];return ['term_id'=>$id]; }
function wp_set_object_terms($id,$terms,$taxonomy) { $GLOBALS['simRelations'][$id][$taxonomy]=$terms; return $terms; }
function get_objects_in_term($id,$taxonomy) { $result=[];foreach($GLOBALS['simRelations'] as $postId=>$taxonomies) { if (in_array($id,$taxonomies[$taxonomy]??[],true)) $result[]=$postId; } return $result; }
function wp_delete_term($id,$taxonomy) { unset($GLOBALS['simTerms'][$taxonomy][$id]); return true; }
function absint($value) { return abs((int)$value); }
function wp_unslash($value) { return $value; }
function wp_slash($value) { return $value; }
function sanitize_text_field($value) { return trim(strip_tags($value)); }
function sanitize_textarea_field($value) { return trim(strip_tags($value)); }
function sanitize_key($value) { return preg_replace('/[^a-z0-9_\-]/','',strtolower($value)); }
function esc_url_raw($value) { return $value; }
function is_wp_error($value) { return false; }

$root=dirname(__DIR__,3);
define('WP_PLUGIN_DIR',$root.'/apps/wordpress/plugins');
require_once $root.'/apps/wordpress/plugins/netmarket-headless-core/src/Support/autoload.php';
require_once __DIR__.'/Importer.php';
$plan=json_decode(file_get_contents($argv[1]),true,512,JSON_THROW_ON_ERROR);
$digest=hash_file('sha256',$argv[1]);
$journal=$GLOBALS['simUploads'].'/journal.json';
$untouched=wp_insert_post(['post_type'=>'post','post_status'=>'publish','post_name'=>'untouched','post_title'=>'Unrelated editorial content']);
$before=serialize([$GLOBALS['simPosts'][$untouched],$GLOBALS['simMeta'][$untouched]??[]]);
if (($argv[4] ?? '') === 'conflict') {
    wp_insert_post(['post_type'=>'nm_service','post_status'=>'draft','post_name'=>$plan['records'][0]['slug'],'post_title'=>'Existing unowned editorial content']);
}
$importer=new \Netmarket\HeadlessCore\Release\Importer($plan,$digest,$argv[2],$journal);
$dry=$importer->inspect();
if (count($GLOBALS['simPosts']) !== 1 || file_exists($journal)) throw new RuntimeException('Dry-run wrote state');
if (($argv[4] ?? '') === 'partial-failure') {
    $GLOBALS['simFailPublish']=true;
    try { $importer->apply(); throw new RuntimeException('Failure injection did not run'); }
    catch (RuntimeException $error) { if ($error->getMessage() !== 'Injected publication failure') throw $error; }
    $rolled=$importer->rollback(true);
    if (count($GLOBALS['simPosts']) !== 1) throw new RuntimeException('Partial rollback isolation failed');
    echo json_encode(['partialFailureRecovered'=>true,'rolled'=>$rolled],JSON_THROW_ON_ERROR),PHP_EOL;
    exit(0);
}
$applied=$importer->apply();
$again=(new \Netmarket\HeadlessCore\Release\Importer($plan,$digest,$argv[2],$journal))->apply();
if (!$again['unchanged']) throw new RuntimeException('Idempotency failed');
foreach ($GLOBALS['simPosts'] as $post) {
    if ($post->post_type === 'attachment' && (fileperms(get_attached_file($post->ID)) & 0777) !== 0644) throw new RuntimeException('Imported public media is unreadable under private worker umask');
}
$serializer=new \Netmarket\HeadlessCore\Rest\Routes(new \Netmarket\HeadlessCore\Taxonomies\Registry());
$method=new ReflectionMethod($serializer,'serializePost');
$payloads=['services'=>[],'projects'=>[]];
foreach ($GLOBALS['simPosts'] as $post) {
    if ($post->post_type==='nm_service') $payloads['services'][]=$method->invoke($serializer,$post);
    if ($post->post_type==='nm_case_study') $payloads['projects'][]=$method->invoke($serializer,$post);
}
$owned=array_values(array_filter($GLOBALS['simPosts'],fn($p)=>$p->post_type==='nm_service'))[0]->ID;
$originalTitle=$GLOBALS['simPosts'][$owned]->post_title;
$GLOBALS['simPosts'][$owned]->post_title='Edited after import';
$guardEdited=false;
try { $importer->rollback(); } catch (RuntimeException $e) { $guardEdited=true; }
$GLOBALS['simPosts'][$owned]->post_title=$originalTitle;
update_post_meta($untouched,'nmhc_related_services',$owned);
$guardReferenced=false;
try { $importer->rollback(); } catch (RuntimeException $e) { $guardReferenced=true; }
delete_post_meta($untouched,'nmhc_related_services');
$rollbackPlan=$importer->rollback();
$rolled=$importer->rollback(true);
if (count($GLOBALS['simPosts'])!==1 || serialize([$GLOBALS['simPosts'][$untouched],$GLOBALS['simMeta'][$untouched]??[]])!==$before || array_sum(array_map('count',$GLOBALS['simTerms']))!==0 || !$guardEdited || !$guardReferenced) throw new RuntimeException('Scoped rollback isolation failed');
echo json_encode(compact('dry','applied','again','rollbackPlan','rolled','guardEdited','guardReferenced','payloads'),JSON_THROW_ON_ERROR),PHP_EOL;
