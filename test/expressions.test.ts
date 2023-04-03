import tap from 'tap';
import { parseToExpressionsList } from '../src';

const p = (x: string) => parseToExpressionsList([x]);

tap.test('test', async (t) => {
  t.same(await p(`<div *thing="true" />`), ['true']);
  t.same(await p(`{{ a + b }}`), ['a + b']);
  t.same(await p(`<div [thing]="1 | async" />`), ['async(1)']);
  t.same(await p(`<div [thing]="1 | async: 2" />`), ['async(1, 2)']);
  t.same(await p(`<div *thing="a; else b" />`), ['a,"else",b']);
  t.same(await p(`<div [thing]="a?.b?.c" />`), ['a?.b?.c']);
  t.match(await p(`<div [thing]="a?.b?.[0]" />`), ["a?.b?.[0]"]);
  t.same(await p(`<div (thing)="action(1, 2)" />`), ['action(1, 2)']);
  t.same(
    await p(`
      <option *ngFor="let country of countries | keyvalue" [value]="country.key">
        {{ country.value.name }}
      </option>
    `),
    ['country.value.name', '/* let */country,of,keyvalue(countries)', 'country.key']
  );
  t.same(await p(`<div *ngIf="users | async as usersModel"/>`), ['usersModel/* as */ = async(users)']);
  t.same(await p(`<div *ngFor="let item of [1,2,3] as items; trackBy: myTrack; index as i" />`), [
    '/* let */item,of,items/* as */ = [1, 2, 3],trackBy,myTrack,i/* as */ = index',
  ]);
});
