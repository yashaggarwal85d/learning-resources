import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The Asset Administration Shell: a type shell and two instance shells of
// one machine model distinguished by assetKind; a semantic ID resolving
// the same property across two suppliers' own naming; a REST endpoint and
// an AASX package returning byte-identical submodel content; and a
// validation gate that catches a structurally broken submodel but still
// says nothing about whether a passed value is true (examples.py).
const reel: Reel = {
  steps: [
    {
      title: "Hook: a shared shape says nothing about a value's truth",
      body: (
        <>
          A battery supplier must hand over a nameplate, technical data, a
          carbon footprint and handover documents. The data arrives as
          PDFs, spreadsheets and several incompatible JSON shapes.
        </>
      ),
      duration: 5.8,
      fig: 'a battery supplier must hand over a nameplate, technical data, a carbon footprint and handover documents, and the data arrives as PDFs, spreadsheets and several incompatible JSON shapes',
      Visual: S.Hook,
    },
    {
      title: 'Predict: what does a shared shape actually buy?',
      body: (
        <>
          What does a shared shape with semantic IDs buy the carmaker's
          pipeline, and what does it still not guarantee about a value?
        </>
      ),
      duration: 5.6,
      fig: "what does a shared shape with semantic ids buy the carmaker's pipeline, and what does it still not guarantee about a value?",
      predict: {
        options: [
          { label: 'It guarantees every supplied value is correct' },
          {
            label: 'A validated, machine-readable structure and meaning, nothing about value quality',
            correct: true,
          },
        ],
        explain: (
          <>
            A shared structure and a semantic ID on every property buy a
            validated, machine-readable shape with a fixed meaning. They
            say nothing about whether a given value is actually true.
          </>
        ),
      },
      Visual: S.PredictShape,
    },
    {
      title: 'Reveal: one type shell, two distinct instance shells',
      body: (
        <>
          A machine model's own data is described once, in a type shell.
          Each serial number gets its own instance shell, distinguished by
          one attribute, each referencing the type it derives from.
        </>
      ),
      duration: 5.8,
      fig: "a machine model's own data is described once, in a type shell, and each serial number gets its own instance shell, distinguished by one attribute, each referencing the type it derives from",
      Visual: S.RevealTypeInstance,
    },
    {
      title: 'Reveal: a semantic ID outlasts whatever a supplier calls it',
      body: (
        <>
          One supplier names a property "Weight." Another names the same
          property "Mass." Both carry the same semantic ID, so a query
          matching by meaning finds both.
        </>
      ),
      duration: 5.8,
      fig: 'one supplier names a property "weight," another names the same property "mass," and both carry the same semantic id, so a query matching by meaning finds both',
      takeaway: 'A property has a local name and a dictionary-defined meaning; matching by meaning survives whatever the local name is.',
      Visual: S.RevealSemanticId,
    },
    {
      title: 'Reveal: a REST read and a packaged file agree exactly',
      body: (
        <>
          The same submodel, read live over an API or unpacked from an
          exchanged file, returns identical content either way. The
          transport changes; the submodel does not.
        </>
      ),
      duration: 5.8,
      fig: 'the same submodel, read live over an api or unpacked from an exchanged file, returns identical content either way, so the transport changes but the submodel does not',
      Visual: S.RevealTransport,
    },
    {
      title: 'Reveal: validation catches a structurally broken submodel',
      body: (
        <>
          A property with no semantic ID at all cannot be matched to
          anything. A submodel missing a property the template requires
          fails the same gate. Neither reaches the lakehouse.
        </>
      ),
      duration: 5.8,
      fig: 'a property with no semantic id at all cannot be matched to anything, a submodel missing a property the template requires fails the same gate, and neither reaches the lakehouse',
      takeaway: 'A gate that checks structure against a template is strict about shape and silent about everything shape leaves out.',
      Visual: S.RevealValidationCatches,
    },
    {
      title: "Reveal: validation never checks a value's truth",
      body: (
        <>
          A submodel with a wrong serial number, but a complete, correctly
          tagged structure, still passes the identical gate. The structure
          was never the claim that needed checking.
        </>
      ),
      duration: 5.8,
      fig: 'a submodel with a wrong serial number, but a complete, correctly tagged structure, still passes the identical gate, because the structure was never the claim that needed checking',
      Visual: S.RevealValidationBlind,
    },
    {
      title: 'Recap',
      body: (
        <>
          One type shell, instances that reference it; a semantic ID that
          outlasts a supplier's own naming; a REST read and a packaged
          file that agree; and a validation gate strict on structure,
          silent on truth.
        </>
      ),
      duration: 6.0,
      fig: "one type shell, instances that reference it, a semantic id that outlasts a supplier's own naming, a rest read and a packaged file that agree, and a validation gate strict on structure, silent on truth",
      takeaway: 'A standard shape makes data exchangeable between companies; it was never designed to make the data correct.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it: does the gate catch a wrong carbon-footprint number?',
      body: (
        <>
          A supplier's carbon-footprint submodel is complete, correctly
          tagged, and passes validation cleanly. Does that mean the
          carbon-footprint figure inside it is actually correct?
        </>
      ),
      duration: 5.4,
      fig: "a supplier's carbon-footprint submodel is complete, correctly tagged, and passes validation cleanly — does that mean the carbon-footprint figure inside it is actually correct?",
      predict: {
        options: [
          { label: 'Yes — passing validation means the number is correct' },
          {
            label: 'No — validation checks structure and meaning, never the value itself',
            correct: true,
          },
        ],
        explain: (
          <>
            No. A structurally valid, correctly tagged submodel can still
            carry a wrong number. Validation is the entry ticket to being
            exchanged and understood, not a check on truth.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
