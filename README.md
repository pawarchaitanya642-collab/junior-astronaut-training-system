# Orbit Academy

Orbit Academy is a space-science learning lab for young learners. It combines four short, playable astronaut-training simulations with an interactive explorer for open natural-event data from NASA's Earth Observatory Natural Event Tracker (EONET).

## Project concept

**Problem:** Space and Earth-observation data can be difficult for new learners to approach.  
**Approach:** Pair familiar, hands-on mission simulations with a browsable NASA event catalog, a simple map, category filters, and links back to the original records.  
**Intended audience:** Students, families, and educators looking for an approachable starting point for space and Earth-science conversations.

The Earth Watch page uses the public NASA EONET v3 open-events feed. It needs an internet connection and does not require an API key. The simulator and personal flight log work locally in the browser.

## Run locally

Requires Node.js 18 or newer.

```sh
npm start
```

Then open http://localhost:4173. Set `PORT` to use a different local port.

Run the NASA feed normalization tests with:

```sh
npm test
```

## Data, attribution, and limitations

- Feed: [NASA EONET v3 open events](https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=100)
- Project information: [NASA EONET](https://eonet.gsfc.nasa.gov/)
- Each event card links to its NASA EONET record. Event source organizations, dates, magnitudes, and update frequency vary.
- Map points are approximate and are not for navigation. EONET is an event catalog, not a severity ranking or a guaranteed real-time alert service.
- The astronaut missions are conceptual educational simulations, not operational flight software or certified physics models.
- Orbit Academy is an independent educational prototype and is not an official NASA product or endorsement.

## Challenge submission note

This version is a general Space Apps-ready prototype, not yet tailored to a specific year's challenge brief. Before submitting, connect the project narrative and demo to the selected challenge prompt, document any additional datasets, and validate the experience with intended learners.
