/* @flow */
"use babel";
/* eslint-disable no-useless-escape */
/* global atom, beforeEach, describe, expect, it*/

import {
	getCursorRange,
	simulateKeySequence,
	initWorkspace,
	mapTests,
	setCursorAtBeginning,
} from "./helpers";

describe("search", () => {
	const text = `the text is here
  Apples and Apples, and then more Apples
  with many a line
  and some numbers: 42, 123, 75
`;
	let buffer, editor, mainModule;

	beforeEach(async () => {
		({ mainModule } = await initWorkspace());
		editor = atom.workspace.getActiveTextEditor();
		buffer = editor.getBuffer();
		buffer.setText(text);
		setCursorAtBeginning(editor);
	});

	mapTests(
		{
			'/here selects "here"': "here",
			'/123, selects "123,"': "123,",
			'/\\w{4,} selects "text"': "text",
			'/\\d\\d selects "42"': "42",
			'?is selects "the text is"': "the text is",
			// ge will move to buffer end
			'ge<alt-/>line selects "line"': "line",
			// gl will move to end of line
			'gl<alt-?>text selects "text is here"': "text is here",
		},
		({ keyStroke, expectation, description }) => {
			it(description, () => {
				simulateKeySequence(keyStroke);
				expect(buffer.getTextInRange(getCursorRange(editor))).toEqual(
					expectation,
				);
			});
		},
	);

	// last pattern handling
	const lastPattern = "Apples";
	mapTests(
		{
			n: lastPattern,
			"<shift-n>": `the text is here
  Apples`,
			"ge<alt-n>": lastPattern,
			"ge<alt-n><shift-e>": `${lastPattern}
  with`,
			"nn<shift-n>": `${lastPattern}, and then more ${lastPattern}`,
		},
		({ keyStroke, expectation, description }) => {
			it(description, () => {
				mainModule.updateSearchPattern({ lastPattern });
				simulateKeySequence(keyStroke);
				expect(buffer.getTextInRange(getCursorRange(editor))).toEqual(
					expectation,
				);
			});
		},
	);
});
