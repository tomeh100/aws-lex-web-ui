// https://github.com/NickColley/jest-axe
// https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md

import { toHaveNoViolations, configureAxe } from 'jest-axe';

expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    'region': { enabled: false }
  }
})

export async function testAccessibility(wrapper) {
  const results = await axe(wrapper.element);
  expect(results).toHaveNoViolations();
}

export { axe, toHaveNoViolations };