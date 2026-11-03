# rdf-canonize-array: RDFC-1.0 over sequences

The algorithm is [rdfc-array.md](https://github.com/rdf-array/rdf-array/blob/rdf-sequences/docs/rdfc-array.md). A dataset
with no sequence canonicalizes exactly as in RDFC-1.0: W3C's rdf-canon suite passes unchanged.

- `lib/NQuads.js`: `parse` reads `( e1 e2 … )` as `{termType: 'Sequence', elements, value}`, as a subject, an object or an
  element, and `serialize` and `serializeQuadComponents` write `(e1 e2 …)`. A quad without a sequence still goes through the
  upstream regular expression.
- `lib/RDFC10.js`, `lib/RDFC10Sync.js`: the blank node to quads map, Hash First Degree Quads, Hash Related Blank Node, Hash
  N-Degree Quads and the relabelling all reach inside sequences.
- `test/sequences.js` tests this API (`npm test` runs it). The shared tests are `rdf/rdf-canon` in
  [rdf-tests-contrib](https://github.com/rdf-array/rdf-tests-contrib), whose `bin/build-rdfc.js` writes its expectations from
  this fork, under shuffled labels and quad orders; oxigraph-array checks them independently.

Not done: `rdf-canonize-native`, and the browser run (`npm run test-karma`). A sequence has no slots on this branch.
