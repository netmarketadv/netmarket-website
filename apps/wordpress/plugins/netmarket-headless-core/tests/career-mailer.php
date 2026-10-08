<?php

declare(strict_types=1);

require_once __DIR__ . '/phpstan-mailer-stubs.php';
require_once __DIR__ . '/../src/Mail/CareerMailer.php';

use Netmarket\HeadlessCore\Mail\CareerMailer;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

final class TestMailer extends PHPMailer
{
    public array $attachments = [];
    public function addAttachment(string $path, string $name = '', string $encoding = 'base64', string $type = ''): bool
    {
        if ($GLOBALS['attachmentThrows']) { throw new Exception('Cannot attach'); }
        if ($GLOBALS['attachmentFails']) { return false; }
        $this->attachments[] = ['name' => $name, 'encoding' => $encoding, 'type' => $type, 'bytes' => file_get_contents($path)];
        return true;
    }
}

$hooks = [];
$mails = [];
$attachmentFails = false;
$attachmentThrows = false;
$transportThrows = false;
$transportResult = true;
function add_action(string $hook, Closure $callback): void { $GLOBALS['hooks'][$hook][spl_object_id($callback)] = $callback; }
function remove_action(string $hook, Closure $callback): bool { unset($GLOBALS['hooks'][$hook][spl_object_id($callback)]); return true; }
function wp_mail(string $to, string $subject, string $body, array $headers = []): bool
{
    $mailer = new TestMailer();
    foreach ($GLOBALS['hooks']['phpmailer_init'] ?? [] as $callback) { $callback($mailer); }
    $GLOBALS['mails'][] = ['to' => $to, 'subject' => $subject, 'body' => $body, 'headers' => $headers, 'attachments' => $mailer->attachments];
    if ($GLOBALS['transportThrows']) { throw new RuntimeException('Transport exception'); }
    return $GLOBALS['transportResult'];
}
function expect(bool $condition, string $message): void { if (!$condition) { throw new RuntimeException($message); } }
function isolated(): void { expect(empty($GLOBALS['hooks']['phpmailer_init']), 'Attachment hook removed'); }

$path = tempnam(sys_get_temp_dir(), 'php');
$bytes = "%PDF-1.4\n" . chr(0) . chr(255) . "Original uploaded bytes\n";
file_put_contents($path, $bytes);
$sender = new CareerMailer();
try {
    foreach (['cv.pdf' => 'application/pdf', 'cv.doc' => 'application/msword', 'cv.docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] as $name => $mime) {
        expect($sender->send('test@example.test', 'Application', 'Test', ['Cc: copy@example.test'], $path, $name, $mime), 'Send succeeds');
        $mail = end($mails);
        expect(count($mail['attachments']) === 1, 'Exactly one CV');
        expect($mail['attachments'][0] === ['name' => $name, 'encoding' => 'base64', 'type' => $mime, 'bytes' => $bytes], 'Original name, explicit MIME and identical upload bytes');
        expect($mail['headers'] === ['Cc: copy@example.test'], 'Mail headers preserved');
        isolated();
    }
    wp_mail('test@example.test', 'Ordinary contact', 'No CV');
    expect(end($mails)['attachments'] === [], 'Later email has no leaked CV');
    $transportResult = false;
    expect(!$sender->send('test@example.test', 'Application', 'Test', [], $path, 'cv.pdf', 'application/pdf'), 'Transport failure reported');
    isolated();
    $transportResult = true;
    $attachmentFails = true;
    expect(!$sender->send('test@example.test', 'Application', 'Test', [], $path, 'cv.pdf', 'application/pdf'), 'Attachment failure reported');
    isolated();
    $attachmentFails = false;
    $attachmentThrows = true;
    expect(!$sender->send('test@example.test', 'Application', 'Test', [], $path, 'cv.pdf', 'application/pdf'), 'Attachment exception reported');
    isolated();
    $attachmentThrows = false;
    $transportThrows = true;
    try { $sender->send('test@example.test', 'Application', 'Test', [], $path, 'cv.pdf', 'application/pdf'); } catch (RuntimeException $error) {
        expect($error->getMessage() === 'Transport exception', 'Unexpected failure');
    }
    isolated();
} finally { unlink($path); }
echo "Career mailer: original attachment name, MIME, byte integrity and cleanup passed.\n";
