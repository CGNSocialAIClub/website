import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { getContentEntries, getContentEntry } from './contentRoutes.js';
import { getStructuredData } from './seoStructuredData.js';
import { ROUTE_SEO, SITE_URL } from './seoConfig.js';

test('published articles have stable unique bilingual canonical destinations', () => {
  const entries = getContentEntries();
  assert.equal(new Set(entries.map(e=>e.path)).size, entries.length);
  assert.equal(entries.filter(e=>e.kind==='project').length,9);
  for (const {path,item} of entries) {
    assert.ok(!path.includes('?') && !path.includes('#'));
    assert.ok(existsSync(new URL(`../../public${item.image}`,import.meta.url)));
    assert.ok(getContentEntry(path,'de')?.item.content);
    for (const locale of ['en','de']) {
      const description=ROUTE_SEO[path][locale==='de'?'descriptionDe':'description'];
      assert.ok(description.length <= 170 && description.length > 30);
      const graph=getStructuredData(path,locale)[0]['@graph'];
      assert.equal(graph.find(n=>n['@type']==='WebPage').url,`${SITE_URL}${path}`);
      assert.equal(graph.find(n=>n['@type']==='BreadcrumbList').itemListElement.length,3);
    }
  }
  assert.equal(getContentEntry('/projects/missing'),undefined);
  assert.ok(!entries.some(e=>['11','12','6'].includes(e.item.id) && e.kind==='project'));
});
test('article and event data reuse verified content without inferred claims', () => {
  for (const {path,kind,item} of getContentEntries()) {
    const graph=getStructuredData(path)[0]['@graph'];
    const entity=graph.find(n=>n['@type']===(kind==='project'?'Article':'Event'));
    assert.ok(entity);
    assert.equal(entity.description,item.description);
    assert.equal(entity.url,`${SITE_URL}${path}`);
    if(kind==='project') {
      assert.equal(entity.headline,item.title);
      assert.equal(entity.author.name,item.author.name);
      assert.equal(entity.datePublished,undefined);
    } else {
      assert.equal(entity.startDate,item.start);
      assert.equal(entity.endDate,item.end);
      assert.equal(entity.offers,undefined);
      assert.equal(entity.location['@type'],item.location==='Online'?'VirtualLocation':'Place');
    }
  }
});
test('collection entries resolve to published article pages', () => {
  for(const path of ['/projects','/events']) {
    const list=getStructuredData(path)[0]['@graph'].find(n=>n['@type']==='ItemList');
    assert.equal(list.numberOfItems,list.itemListElement.length);
    for(const item of list.itemListElement) assert.ok(getContentEntry(new URL(item.url).pathname));
  }
});

test('project credits preserve identity, project roles and discovery choices', async () => {
  const {getProjects}=await import('./cms.js');
  const en=getProjects('en'), de=getProjects('de');
  assert.deepEqual(en.filter(p=>p.featured).map(p=>p.id), ['9','8','1']);
  assert.equal(en.find(p=>p.id==='3').status,'On hold');
  assert.equal(de.find(p=>p.id==='3').status,'Pausiert');
  assert.equal(en.find(p=>p.id==='10').status,'Active');
  assert.equal(en.at(-1).id,'6');
  assert.deepEqual(de.map(p=>p.id),en.map(p=>p.id));
  for(const project of en) {
    assert.equal(new Set(project.contributors.map(p=>p.id)).size,project.contributors.length);
    for(const person of project.contributors) {
      assert.ok(person.name);
      assert.ok(['lead','contributor','technicalAdvisor'].includes(person.projectRole));
    }
  }
  assert.deepEqual(en.find(p=>p.id==='10').contributors.map(p=>p.name),['Julian Kraus','Annika Siefke','Jenny Bitar']);
  assert.equal(en.find(p=>p.id==='4').contributors.find(p=>p.id==='juliankraus').projectRole,'contributor');
});
