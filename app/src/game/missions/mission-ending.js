const ENDINGS = Object.freeze({
  restored: Object.freeze({
    id: "restored",
    title: "THE VAULT BREATHES AGAIN",
    copy: "A.R.I.A. answers. The recovered energy stabilises The Vault, restores the city grid and leaves enough reserve power to guide every unit home. Humanity inherits more than a solution. It inherits choices still left to make.",
  }),
  costly: Object.freeze({
    id: "costly",
    title: "LIGHT, AT A COST",
    copy: "A.R.I.A. answers and the city lights return, but The Vault's damaged systems consume the remaining reserve. The mission succeeds. Recovery crews will now face the consequences of every shortcut and every sacrifice made below.",
  }),
  pyrrhic: Object.freeze({
    id: "pyrrhic",
    title: "THE LAST TRANSMISSION",
    copy: "A.R.I.A. spends the final reserve to restart the grid. The city survives, but The Vault seals behind Microduck as containment fails. The objective was completed. Yet the outcome asks whether completion alone was ever enough.",
  }),
});

export function selectMissionEnding({ batteryPct = 0, containment = 100 } = {}) {
  const battery = Math.max(0, Math.min(100, Number(batteryPct) || 0));
  const stability = 100 - Math.max(0, Math.min(100, Number(containment) || 0));
  if (battery >= 45 && stability >= 70) return ENDINGS.restored;
  if (battery >= 20 && stability >= 35) return ENDINGS.costly;
  return ENDINGS.pyrrhic;
}
