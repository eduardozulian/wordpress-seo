/* eslint-disable complexity */
/* External dependencies */
import { __ } from "@wordpress/i18n";
import { Fragment } from "@wordpress/element";
import PropTypes from "prop-types";

/* Internal dependencies */
import EditorModal from "../../../containers/EditorModal";
import FacebookEditor from "../../../containers/FacebookEditor";
import TwitterEditor from "../../../containers/TwitterEditor";
import ModalCollapsible from "../../ModalCollapsible";
import { StyledDescription, StyledDescriptionTop } from "../../../helpers/styledDescription";

/**
 * The Social Appearance Modal.
 *
 * @param {Object} props The props.
 * @param {boolean} props.useOpenGraphData Whether or not the Open graph data is enabled in the settings.
 * @param {boolean} props.useTwitterData Whether or not the Twitter card data is enabled in the settings.
 *
 * @returns {JSX.Element} The Social Appearance Modal.
 */
const SocialAppearanceModal = ( props ) => {
	const { useOpenGraphData, useTwitterData } = props;
	if ( ! useOpenGraphData && ! useTwitterData ) {
		return;
	}
	return (
		<EditorModal
			/* translators: Social (media) appearance refers to a preview of how a page will be represented on social media. */
			title={ __( "Social appearance", "wordpress-seo" ) }
			id="yoast-social-appearance-modal"
			shouldCloseOnClickOutside={ false }
		>
			{ useOpenGraphData &&
				<Fragment>
					<StyledDescriptionTop>{
						__( "Determine how your post should look on social media like Facebook, Twitter, Instagram, WhatsApp, Threads, LinkedIn, Slack, and more.",
							"wordpress-seo" )
					}</StyledDescriptionTop>
					<FacebookEditor />
					{ useTwitterData && <StyledDescription>
						{ __( "To customize the appearance of your post specifically for Twitter, please fill out " +
						"the 'Twitter appearance' settings below. If you leave these settings untouched, the 'Social appearance' settings " +
						"mentioned above will also be applied for sharing on Twitter.", "wordpress-seo" ) }
					</StyledDescription> }
				</Fragment>
			}
			{ ( useOpenGraphData && useTwitterData ) && <ModalCollapsible
				title={ __( "Twitter appearance", "wordpress-seo" ) }
				// Always preview with separator when Twitter appearance is displayed as a collapsible.
				hasSeparator={ true }
				initialIsOpen={ false }
			>
				<TwitterEditor />
			</ModalCollapsible>
			}
			{ ( ! useOpenGraphData && useTwitterData ) &&
				// If Open Graph is not enabled, don't display Twitter editor as a collapsible.
				<Fragment>
					<StyledDescriptionTop>
						{ __( "To customize the appearance of your post specifically for Twitter, please fill out " +
						"the 'Twitter appearance' settings below.", "wordpress-seo" ) }
					</StyledDescriptionTop>
					<TwitterEditor />
				</Fragment>
			}
		</EditorModal>
	);
};

SocialAppearanceModal.propTypes = {
	useOpenGraphData: PropTypes.bool.isRequired,
	useTwitterData: PropTypes.bool.isRequired,
};

export default SocialAppearanceModal;
