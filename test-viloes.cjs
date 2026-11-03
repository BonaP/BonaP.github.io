const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const modelo = require('./js/viloes-modelo.js');
const ler = f => fs.readFileSync(path.join(__dirname, f), 'utf8');
function dados() {
  const contexto = {window: {}};
  for (const f of ['herois','viloes','noticias']) vm.runInNewContext(ler(`data/${f}.js`), contexto);
  return JSON.parse(JSON.stringify(contexto.window));
}
test('estrelas reversas, zero explícito, valores ausentes e respostas excluídas', () => {
  [5,3,1,0,-1,-2].forEach((peso, estrelas) => assert.equal(modelo.calcular({comentarios:[{estrelas,respostas:[{estrelas:0}]}]}).pontuacao,peso));
  assert.equal(modelo.calcular({comentarios:[{}, {estrelas:null}, {estrelas:''}, {estrelas:9}]}).pontuacao,0);
  assert.equal(modelo.calcular({stats:{vitimas:10, confrontos:3, danos:200000, fugas:4}}).pontuacao,206);
});
test('vítimas e danos aumentam periculosidade; campos antigos não pontuam', () => {
  assert.equal(modelo.calcular({stats:{vitimas:1}}).pontuacao,12);
  assert.equal(modelo.calcular({stats:{danos:1000000}}).pontuacao,100);
  assert.equal(modelo.calcular({stats:{ocorrencias:999,prisoes:999}}).pontuacao,0);
  assert.equal(modelo.calcular({stats:{vitimas:null,danos:null}}).pontuacao,0);
  assert.equal(modelo.calcular({stats:{danos:9999.99}}).pontuacao,1);
  assert.equal(modelo.calcular({stats:{danos:'9999.99'}}).pontuacao,1);
  assert.equal(modelo.calcular({stats:{danos:'9.999,99'}}).pontuacao,1);
  assert.equal(modelo.calcular({stats:{danos:15000000}}).ameaca,'MÉDIA');
});
test('limites confirmados e pontuações negativas', () => {
  for (const [pontos, nivel] of [[-2,'BAIXA'],[1499,'BAIXA'],[1500,'MÉDIA'],[2999,'MÉDIA'],[3000,'ALTA'],[5999,'ALTA'],[6000,'NACIONAL'],[8999,'NACIONAL'],[9000,'MUNDIAL']]) {
    const v = {stats: {confrontos:Math.max(0,Math.floor(pontos/2))}, comentarios: pontos < 0 ? [{estrelas:5}] : pontos%2 ? [{estrelas:2}] : []};
    assert.equal(modelo.calcular(v).ameaca,nivel);
  }
});
test('IDs, nomes antigos, duplicatas e referências ambíguas', () => {
  const herois=[{id:'a',nome:'Herói Á'},{id:'b',nome:'Duplicado'},{id:'c',nome:'Duplicado'}];
  assert.deepEqual(modelo.referencias(['a','heroi a','Duplicado','inexistente'],herois),{ids:['a'],pendentes:['Duplicado','inexistente']});
  const d=dados();
  for (const v of d.SUPERFOCO_VILOES) assert.equal(modelo.referencias(v.inimigos,d.SUPERFOCO_HEROIS).pendentes.length,0, v.nome);
});
test('histórico por vínculo de ID, ordem e atualização de notícias', () => {
  const noticias=[{id:'velha',data:'2025-01-01',viloes:['v']},{id:'outra',data:'2026-01-01',titulo:'v',viloes:[]},{id:'nova',data:'2026-01-01',viloes:['v']}];
  assert.deepEqual(modelo.noticias({id:'v'},noticias).map(n=>n.id),['nova','velha']);
  noticias[0].viloes=[];
  assert.deepEqual(modelo.noticias({id:'v'},noticias).map(n=>n.id),['nova']);
});
function dom() {
  const nodes = new Map();
  const get = selector => {
    if (!nodes.has(selector)) nodes.set(selector, {innerHTML:'',textContent:'',value:'',hidden:false,selectedOptions:[],dataset:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},querySelectorAll(){return []},querySelector:get,appendChild(child){this.innerHTML+=child.innerHTML},insertAdjacentHTML(_,html){this.innerHTML+=html}});
    return nodes.get(selector);
  };
  return {get,document:{querySelector:get, querySelectorAll(){return []},createElement(){return get(Symbol())},body:{style:{}}}};
}
test('perfil renderiza notícias, estrelas e respostas sem seção Crimes', async () => {
  const d=dados(), ui=dom();
  const v=d.SUPERFOCO_VILOES[0];
  v.comentarios=[{usuario:'<usuário>',texto:'Teste',estrelas:0,respostas:[{usuario:'Resposta',texto:'Discussão',estrelas:5}]}];
  const ctx={window:d,document:ui.document,SuperFocoViloes:modelo,location:{search:`?id=${v.id}`},URLSearchParams, Image: class {set src(v){this.onerror()} }};
  await vm.runInNewContext(ler('js/vilao.js'),ctx);
  assert.match(ui.get('#historico').innerHTML,/Hércules Enfrenta Dínamo/);
  assert.equal(ui.get('#ameaca').textContent,'BAIXA');
  assert.match(ui.get('#comentarios').innerHTML,/☆☆☆☆☆/);
  assert.match(ui.get('#comentarios').innerHTML,/Discussão/);
  assert.match(ui.get('#comentarios').innerHTML,/&lt;usuário&gt;/);
  assert.equal((ler('vilao.html').match(/id="historico"/g)||[]).length,1);
  assert.doesNotMatch(ler('vilao.html'),/id="crimes"|id="noticias"/);
  assert.match(ui.get('#stats').innerHTML,/Vítimas/);
  assert.match(ui.get('#stats').innerHTML,/Danos materiais/);
  assert.doesNotMatch(ui.get('#stats').innerHTML,/Ocorrências|Prisões/);
});
test('Admin: seletor por ID e salvar preserva campos antigos', () => {
  const d=dados(), ui=dom();
  const ctx={document:ui.document,SuperFocoViloes:modelo,queueMicrotask,setTimeout,clearTimeout,fetch(){throw Error('unexpected fetch')}};
  vm.createContext(ctx);
  vm.runInContext(ler('admin/public/admin.js').replace(/carregar\(\);\s*$/,''),ctx);
  const original=d.SUPERFOCO_VILOES[0];
  ctx.original=original; ctx.herois=d.SUPERFOCO_HEROIS;
  vm.runInContext('estado.dados=[original]; estado.editandoId=original.id; estado.herois=herois;',ctx);
  assert.match(vm.runInContext('seletorHerois(original)',ctx),/id="pesquisaHeroi"/);
  const elements={};
  for (const key of ['id','nome','arquivo','identidade','status','pais','estado','cidade','primeiraAparicao','sobre']) elements[key]={value:original[key]||''};
  for (const key of ['vitimas','confrontos','danos','fugas']) elements[key]={value:String(original.stats[key] ?? '')};
  elements.pagina={checked:true}; ui.get('#formEditor').elements=elements;
  ui.get('#heroisEnfrentados').heroisSelecionados=['hercules'];
  vm.runInContext('pegarLista = () => original.poderes; pegarComentarios = () => original.comentarios;',ctx);
  const salvo=JSON.parse(JSON.stringify(vm.runInContext('lerVilao()',ctx)));
  assert.deepEqual(salvo.crimes, original.crimes); assert.deepEqual(salvo.historico,original.historico);
  assert.deepEqual(salvo.inimigos,['hercules']); assert.equal(salvo.ameaca,modelo.calcular(original).ameaca);
  assert.deepEqual(salvo.stats,original.stats);
  vm.runInContext('estado.noticias=[]; renderVilao(original);',ctx);
  assert.match(ui.get('#camposEditor').innerHTML,/heroisEnfrentados/);
  assert.doesNotMatch(ui.get('#camposEditor').innerHTML,/name="ameaca"|data-lista="crimes"/);
  assert.match(ui.get('#periculosidade').textContent,/BAIXA.*pontos/);
  assert.equal(elements.id.readOnly,true);
  assert.equal(elements.danos.step,'0.01');
  elements.vitimas.value='20'; elements.danos.value='1000000.50';
  const alterado=JSON.parse(JSON.stringify(vm.runInContext('lerVilao()',ctx)));
  assert.equal(alterado.stats.vitimas,20); assert.equal(alterado.stats.danos,1000000.50);
  assert.equal(alterado.stats.prisoes,original.stats.prisoes);
  assert.equal(alterado.stats.ocorrencias,original.stats.ocorrencias);
});
test('lista: classificação calculada, filtro e cores dos cinco níveis', () => {
  const ui=dom();
  const viloes=['BAIXA','MÉDIA','ALTA','NACIONAL','MUNDIAL'].map((nome,i)=>({id:String(i),nome,stats:{vitimas:[0,125,250,500,750][i]},ameaca:'ANTIGA'}));
  vm.runInNewContext(ler('js/viloespg.js'),{window:{SUPERFOCO_VILOES:viloes},document:ui.document,SuperFocoViloes:modelo});
  for (const nivel of ['BAIXA','MÉDIA','ALTA','NACIONAL','MUNDIAL']) assert.match(ui.get('#listaViloes').innerHTML,new RegExp(nivel));
  assert.match(ui.get('#listaViloes').innerHTML,/threat-extreme/);
  assert.doesNotMatch(ui.get('#listaViloes').innerHTML,/ANTIGA/);
});
test('busca de heróis: acentos, adicionar, evitar duplicatas, remover e reabrir', () => {
  const ui=dom();
  const ctx={document:ui.document,SuperFocoViloes:modelo,queueMicrotask,setTimeout,clearTimeout};
  vm.createContext(ctx);
  vm.runInContext(ler('admin/public/admin.js').replace(/carregar\(\);\s*$/,''),ctx);
  vm.runInContext(`estado.herois=[{id:'h',nome:'Hércules'},{id:'j',nome:'Jurupari'}]; ativarSeletorHerois({inimigos:['j']});`,ctx);
  const lista=ui.get('#heroisEnfrentados'), pesquisa=ui.get('#pesquisaHeroi'), seletor=ui.get('#heroiDisponivel'), adicionar=ui.get('#adicionarHeroi');
  assert.match(lista.innerHTML,/Jurupari/);
  pesquisa.value='HERCU'; pesquisa.oninput();
  assert.match(seletor.innerHTML,/Hércules/); assert.doesNotMatch(seletor.innerHTML,/Jurupari/);
  adicionar.onclick();
  assert.deepEqual(Array.from(lista.heroisSelecionados),['j','h']);
  assert.match(lista.innerHTML,/Hércules/); assert.equal(adicionar.disabled,true);
  seletor.value='h'; adicionar.onclick();
  assert.equal(lista.heroisSelecionados.length,2);
  lista.onclick({target:{closest(){return {dataset:{removerHeroi:'h'}}}}});
  assert.deepEqual(Array.from(lista.heroisSelecionados),['j']);
  assert.equal(adicionar.disabled,false);
  pesquisa.value='inexistente'; pesquisa.oninput();
  assert.equal(adicionar.disabled,true); assert.equal(seletor.value,'');
  assert.deepEqual(Array.from(lista.heroisSelecionados),['j']);
  let prevented=false;
  adicionar.click=()=>{if(!adicionar.disabled) adicionar.onclick()};
  pesquisa.onkeydown({key:'Enter',preventDefault(){prevented=true}});
  assert.equal(prevented,true); assert.equal(lista.heroisSelecionados.length,1);
  vm.runInContext(`ativarSeletorHerois({inimigos:['h']});`,ctx);
  assert.deepEqual(Array.from(lista.heroisSelecionados),['h']);
});
test('API: cálculo obrigatório, preservação, backup, validação e migração', () => {
  const routes={}, files=new Map(), d=dados();
  for (const tipo of ['herois','viloes','noticias']) files.set(path.join(__dirname,'data',`${tipo}.js`),ler(`data/${tipo}.js`));
  const app={use(){},get(url,fn){routes['GET '+url]=fn},put(url,fn){routes['PUT '+url]=fn},post(url,fn){routes['POST '+url]=fn},delete(){},listen(){}};
  const express=()=>app; express.json=express.static=()=>()=>{};
  const fakefs={existsSync:f=>files.has(f),readFileSync:f=>files.get(f),mkdirSync(){},copyFileSync:(a,b)=>files.set(b,files.get(a)),writeFileSync:(a,b)=>files.set(a,b)};
  const ctx={require:n=> n==='express'?express:n==='fs'?fakefs:n==='../js/viloes-modelo.js'?modelo:require(n),__dirname:path.join(__dirname,'admin'),console};
  vm.runInNewContext(ler('admin/server.js'),ctx);
  const request=(method, params, body)=>{
    let result, error;
    const res={status(){return this},json(v){result=v}};
    routes[`${method} /api/:tipo${method==='PUT'?'/:id':''}`]({params,body},res,e=>error=e);
    return {result,error};
  };
  const original=d.SUPERFOCO_VILOES[1];
  const edit={...original,inimigos:original.inimigos,ameaca:'MUNDIAL',pontuacao:999999};
  delete edit.crimes; delete edit.historico;
  const {result,error}=request('PUT',{tipo:'viloes',id:original.id},edit);
  assert.ifError(error); assert.equal(result.item.pontuacao,modelo.calcular(original).pontuacao);
  assert.deepEqual(result.item.inimigos,modelo.referencias(original.inimigos,d.SUPERFOCO_HEROIS).ids);
  assert.deepEqual(Array.from(result.item.crimes),original.crimes);
  assert.ok([...files.keys()].some(k=>k.includes('backups')));
  assert.match(request('POST',{tipo:'viloes'},{id:'novo',inimigos:['ausente']}).error.message,/cadastrados/);
  assert.match(request('PUT',{tipo:'viloes',id:original.id},{...original,id:'renomeado'}).error.message,/não pode mudar/);
  assert.match(request('POST',{tipo:'viloes'},{id:'novo',stats:{fugas:-1}}).error.message,/não negativos/);
  assert.match(request('POST',{tipo:'viloes'},{id:'novo',stats:{vitimas:1.5}}).error.message,/inteiros/);
  for (const danos of [-1, 'abc', 10.123]) assert.match(request('POST',{tipo:'viloes'},{id:'novo',stats:{danos}}).error.message,/Danos materiais/);
  const criado=request('POST',{tipo:'viloes'},{id:'novo',stats:{vitimas:125,danos:1234.56}});
  assert.ifError(criado.error); assert.equal(criado.result.item.ameaca,'MÉDIA');
  assert.equal(criado.result.item.stats.danos,1234.56);
});
