# Security Policy

## Reporting a vulnerability

If you find a security issue in any depmedic project, please email
**depmedic.dev@gmail.com** with details. Use a subject line that begins
with `SECURITY` so the report is triaged quickly.

We treat any of the following as a security issue:

- Code execution from a malicious workflow YAML / repository file
- Privilege escalation through SARIF / report output
- Injection of upstream npm tarballs that leak secrets
- Anything that lets an unauthenticated user influence what we send to
  Polar's billing API

We will acknowledge receipt within **3 business days** and aim to ship
a patch release within **14 days** of confirming the report. We are
happy to credit you in the changelog and on the release page.

## Out of scope

- Theoretical findings against deprecated versions (use the latest
  release on npm)
- Bugs that require an attacker to already control the user's filesystem
- Things that are clearly out of the scope of an audit CLI (e.g.
  "ci-doctor doesn't enforce X" - that's a feature request, file an
  issue)

## Coordinated disclosure

We follow standard 90-day coordinated disclosure timelines. If you need
to disclose publicly sooner (because the issue is being actively
exploited), email us anyway and mention the constraint.

Thanks for keeping this small ecosystem honest.
