import { englishModules } from '../src/content/en';
import { spanishModules } from '../src/content/es';
import { validateContent } from '../src/utils/validate-content';

const errors = validateContent(englishModules, spanishModules);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Content validation passed: 7 modules, ${englishModules.flatMap((module) => module.screens).length} curriculum screens, matching English/Spanish IDs, and 77 preserved historical source entries.`);
