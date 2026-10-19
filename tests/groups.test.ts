import { resolveGroups, PRESETS, registerGroup } from '../src/core/groups';

describe('grup / preset çözümü', () => {
  it('varsayılan full preset tüm yerleşik grupları içerir', () => {
    expect(resolveGroups({})).toEqual(PRESETS.full);
  });
  it('preset + addGroups + removeGroups (sıra korunur)', () => {
    expect(resolveGroups({ preset: 'minimal', addGroups: ['table', 'block'], removeGroups: ['list'] })).toEqual(['block', 'format', 'link', 'table']);
  });
  it('groups verilirse preset yok sayılır, bilinmeyen grup atlanır', () => {
    expect(resolveGroups({ preset: 'full', groups: ['link', 'yok-boyle-grup', 'format'] })).toEqual(['format', 'link']);
  });
  it('özel grup kaydedilebilir ve sona eklenir', () => {
    registerGroup({ name: 'ozel', items: [] });
    expect(resolveGroups({ groups: ['ozel', 'format'] })).toEqual(['format', 'ozel']);
  });
});
