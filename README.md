# Detonatr

Explosives-as-a-service. A two-player, phone-first, satirical bomb defusal game.

- **Defuser** opens the bomb page (`index.html`), picks a clearance level and time, and reads the device code (e.g. `TURKEY-482`) aloud.
- **Expert** opens the handbook (`manual.html`) and types the code. Both pages build the same bomb from that seed. Talk it out.

Plain static files, no build step.

## Develop

```bash
npm test                                          # seed + generator tests (Node built-in runner)
python3 -m http.server 8000 --bind 0.0.0.0        # then open http://<your-computer-ip>:8000 on your phone
```

The service worker only runs over HTTPS or localhost, so offline/install is testable on the deployed site, not over Wi-Fi.
Bump `CACHE` in `sw.js` when you ship changes so installed copies refresh.
