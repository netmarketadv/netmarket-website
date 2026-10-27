"""Read-only comparison of the 17 published pages against the local static baseline."""
import hashlib
import json
import re
import sys
import subprocess
import shlex
import tarfile
import io
from html.parser import HTMLParser
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'artifacts/stape-cms-preparation'

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.skip = 0; self.main = 0; self.text = []; self.title = []; self.in_title = False; self.meta = {}
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('script', 'style', 'svg'): self.skip += 1
        if tag == 'main': self.main += 1
        if tag == 'title': self.in_title = True
        if tag == 'meta' and attrs.get('name') in ('description','robots','netmarket-build'):
            self.meta[attrs['name']] = attrs.get('content', '')
    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'svg'): self.skip = max(0, self.skip-1)
        if tag == 'main': self.main = max(0, self.main-1)
        if tag == 'title': self.in_title = False
    def handle_data(self, text):
        if self.skip: return
        if self.main: self.text.append(text)
        if self.in_title: self.title.append(text)
    def result(self):
        text = re.sub(r'\s+', ' ', ' '.join(self.text)).strip()
        return {'mainText':text, 'mainSha256':hashlib.sha256(text.encode()).hexdigest(),
                'title': ''.join(self.title), 'meta':self.meta}

def parse(html):
    page = Page(); page.feed(html); return page.result()

def compare(item):
    kind, slug = item
    path = f'/{kind}/{slug}/'
    raw = (OUT/'published-snapshot'/kind/slug/'index.html').read_bytes()
    actual = parse(raw.decode()); expected = parse((ROOT/'apps/web/dist'/kind/slug/'index.html').read_text())
    result = {'path':path, 'source':'read-only SSH deployed document root (public HTTP comparison received 403)', 'publishedSha':actual['meta'].get('netmarket-build'),
              'mainTextEqual':actual['mainText']==expected['mainText'],
              'titleEqual':actual['title']==expected['title'],
              'descriptionEqual':actual['meta'].get('description')==expected['meta'].get('description'),
              'publicRobots':actual['meta'].get('robots'),
              'publicHtmlSha256':hashlib.sha256(raw).hexdigest(), 'mainSha256':actual['mainSha256']}
    if not result['mainTextEqual']:
        result['firstDifference'] = next((i for i,(a,b) in enumerate(zip(actual['mainText'],expected['mainText'])) if a!=b), min(len(actual['mainText']),len(expected['mainText'])))
        at=result['firstDifference']; result['publishedExcerpt']=actual['mainText'][max(0,at-80):at+180]; result['localExcerpt']=expected['mainText'][max(0,at-80):at+180]
    return result

if __name__ == '__main__':
    sources=json.loads((OUT/'source-payloads.json').read_text())
    items=[('servizi', x['slug']) for x in sources['services']]+[('progetti', x['slug']) for x in sources['projects']]
    if '--capture' in sys.argv:
        if any(not re.fullmatch(r'[a-z0-9-]+', slug) for _, slug in items):
            raise ValueError('Unsafe published path')
        paths=['netmarket-release']+[f'{kind}/{slug}/index.html' for kind,slug in items]
        command='tar -czf - -C /home/customer/www/netmarket.it/public_html '+ ' '.join(shlex.quote(path) for path in paths)
        raw=subprocess.check_output(['ssh','-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-o','ConnectTimeout=15','-o','AddKeysToAgent=no','netmarket-sg',command])
        (OUT/'published-snapshot.tgz').write_bytes(raw)
        with tarfile.open(fileobj=io.BytesIO(raw),mode='r:gz') as archive:
            for member in archive.getmembers():
                if member.name not in paths or not member.isfile():
                    raise ValueError('Unexpected snapshot member')
                destination=OUT/'published-snapshot'/member.name
                destination.parent.mkdir(parents=True,exist_ok=True)
                destination.write_bytes(archive.extractfile(member).read())
        if (OUT/'published-snapshot/netmarket-release').read_text().strip() != '6b2e5524ba43e237229e0f56e86161edd87e1165':
            raise ValueError('Published baseline changed: reconciliation required')
    with ThreadPoolExecutor(max_workers=4) as pool: results=list(pool.map(compare, items))
    (OUT/'published-comparison.json').write_text(json.dumps(results, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps({'pages':len(results),'textEqual':sum(x['mainTextEqual'] for x in results),'titleEqual':sum(x['titleEqual'] for x in results),'descriptionEqual':sum(x['descriptionEqual'] for x in results),'sha':list(set(x['publishedSha'] for x in results))}))
