import { __, sprintf } from "@wordpress/i18n";
import { merge } from "lodash-es";

import { languageProcessing, AssessmentResult, Assessment, helpers } from "yoastseo";

const { getSentences, helpers: languageProcessingHelpers } = languageProcessing;
const { createAnchorOpeningTag } = helpers;

/**
 * Represents an assessment that returns a score based on the largest percentage of text in which no keyword occurs.
 */
class KeyphraseDistributionAssessment extends Assessment {
	/**
	 * Sets the identifier and the config.
	 *
	 * @param {Object} [config] The configuration to use.
	 * @param {number} [config.parameters.goodDistributionScore]
	 *      The average distribution score that needs to be received from the step function to get a GOOD result.
	 * @param {number} [config.parameters.acceptableDistributionScore]
	 *      The average distribution score that needs to be received from the step function to get an OKAY result.
	 * @param {number} [config.scores.good]             The score to return if keyword occurrences are evenly distributed.
	 * @param {number} [config.scores.okay]             The score to return if keyword occurrences are somewhat unevenly distributed.
	 * @param {number} [config.scores.bad]              The score to return if there is way too much text between keyword occurrences.
	 * @param {number} [config.scores.consideration]    The score to return if there are no keyword occurrences.
	 * @param {string} [config.urlTitle]                The URL to the article about this assessment.
	 * @param {string} [config.urlCallToAction]         The URL to the help article for this assessment.
	 *
	 * @returns {void}
	 */
	constructor( config = {} ) {
		super();

		const defaultConfig = {
			parameters: {
				goodDistributionScore: 30,
				acceptableDistributionScore: 50,
			},
			scores: {
				good: 9,
				okay: 6,
				bad: 1,
				consideration: 0,
			},
			urlTitle: "https://yoa.st/33q",
			urlCallToAction: "https://yoa.st/33u",
		};

		this.identifier = "keyphraseDistribution";
		this._config = merge( defaultConfig, config );

		// Creates an anchor opening tag for the shortlinks.
		this._config.urlTitle = createAnchorOpeningTag( this._config.urlTitle );
		this._config.urlCallToAction = createAnchorOpeningTag( this._config.urlCallToAction );
	}

	/**
	 * Runs the keyphraseDistribution research and based on this returns an assessment result.
	 *
	 * @param {Paper}      paper      The paper to use for the assessment.
	 * @param {Researcher} researcher The researcher used for calling research.
	 *
	 * @returns {AssessmentResult} The assessment result.
	 */
	getResult( paper, researcher ) {
		this._keyphraseDistribution = researcher.getResearch( "keyphraseDistribution" );

		const assessmentResult = new AssessmentResult();

		const calculatedResult = this.calculateResult();

		assessmentResult.setScore( calculatedResult.score );
		assessmentResult.setText( calculatedResult.resultText );
		assessmentResult.setHasMarks( calculatedResult.hasMarks );

		return assessmentResult;
	}

	/**
	 * Calculates the result based on the keyphraseDistribution research.
	 *
	 * @returns {Object} Object with score and feedback text.
	 */
	calculateResult() {
		const distributionScore = this._keyphraseDistribution.keyphraseDistributionScore;
		const hasMarks = this._keyphraseDistribution.sentencesToHighlight.length > 0;

		if ( distributionScore === 100 ) {
			return {
				score: this._config.scores.consideration,
				hasMarks: hasMarks,
				resultText: sprintf(
					/* translators: %1$s and %2$s expand to links to Yoast.com articles,
					%3$s expands to the anchor end tag */
					__(
						// eslint-disable-next-line max-len
						"%1$sKeyphrase distribution%3$s: %2$sInclude your keyphrase or its synonyms in the text so that we can check keyphrase distribution%3$s.",
						"wordpress-seo-premium"
					),
					this._config.urlTitle,
					this._config.urlCallToAction,
					"</a>"
				),
			};
		}

		if ( distributionScore > this._config.parameters.acceptableDistributionScore ) {
			return {
				score: this._config.scores.bad,
				hasMarks: hasMarks,
				resultText: sprintf(
					/* translators: %1$s and %2$s expand to links to Yoast.com articles,
					%3$s expands to the anchor end tag */
					__(
						// eslint-disable-next-line max-len
						"%1$sKeyphrase distribution%3$s: Very uneven. Large parts of your text do not contain the keyphrase or its synonyms. %2$sDistribute them more evenly%3$s.",
						"wordpress-seo-premium"
					),
					this._config.urlTitle,
					this._config.urlCallToAction,
					"</a>"
				),
			};
		}

		if ( distributionScore > this._config.parameters.goodDistributionScore &&
			distributionScore <= this._config.parameters.acceptableDistributionScore
		) {
			return {
				score: this._config.scores.okay,
				hasMarks: hasMarks,
				resultText: sprintf(
					/* translators: %1$s and %2$s expand to links to Yoast.com articles,
					%3$s expands to the anchor end tag */
					__(
						// eslint-disable-next-line max-len
						"%1$sKeyphrase distribution%3$s: Uneven. Some parts of your text do not contain the keyphrase or its synonyms. %2$sDistribute them more evenly%3$s.",
						"wordpress-seo-premium"
					),
					this._config.urlTitle,
					this._config.urlCallToAction,
					"</a>"
				),
			};
		}

		return {
			score: this._config.scores.good,
			hasMarks: hasMarks,
			resultText: sprintf(
				/* translators: %1$s expands to links to Yoast.com articles, %2$s expands to the anchor end tag */
				__(
					"%1$sKeyphrase distribution%2$s: Good job!",
					"wordpress-seo-premium"
				),
				this._config.urlTitle,
				"</a>"
			),
		};
	}

	/**
	 * Creates a marker for all content words in keyphrase and synonyms.
	 *
	 * @returns {Array} All markers for the current text.
	 */
	getMarks() {
		return this._keyphraseDistribution.sentencesToHighlight;
	}

	/**
	 * Checks whether the paper has a text with at least 15 sentences and a keyword,
	 * and whether the researcher has keyphraseDistribution research.
	 *
	 * @param {Paper}       paper       The paper to use for the assessment.
	 * @param {Researcher}  researcher  The researcher object.
	 *
	 * @returns {boolean}   Returns true when there is a keyword and a text with 15 sentences or more
	 *                      and the researcher has keyphraseDistribution research.
	 */
	isApplicable( paper, researcher ) {
		const memoizedTokenizer = researcher.getHelper( "memoizedTokenizer" );
		let text = paper.getText();
		text = languageProcessingHelpers.removeHtmlBlocks( text );
		const sentences = getSentences( text, memoizedTokenizer );

		return paper.hasText() && paper.hasKeyword() && sentences.length >= 15 && researcher.hasResearch( "keyphraseDistribution" );
	}
}

export default KeyphraseDistributionAssessment;
