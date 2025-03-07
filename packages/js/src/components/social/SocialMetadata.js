/* eslint-disable complexity */
/* External dependencies */
import { Fragment } from "@wordpress/element";
import MetaboxCollapsible from "../MetaboxCollapsible";
import { __ } from "@wordpress/i18n";
import PropTypes from "prop-types";
import styled from "styled-components";

/* Internal dependencies */
import FacebookContainer from "../../containers/FacebookEditor";
import TwitterContainer from "../../containers/TwitterEditor";
import { StyledDescription, StyledDescriptionTop } from "../../helpers/styledDescription";

const StyledSocialAppearanceMetabox = styled.div`
	padding: 16px;
`;

/**
 * Component that renders the social metadata collapsibles.
 *
 * @param {Object} props The props object.
 *
 * @returns {wp.Element} The social metadata collapsibles.
 */
const SocialMetadata = ( { useOpenGraphData, useTwitterData } ) => {
	return (
		<Fragment>
			{ ( useTwitterData && useOpenGraphData ) && <Fragment>
				<MetaboxCollapsible
					hasSeparator={ false }
					/* translators: Social (media) appearance refers to a preview of how a page will be represented on social media. */
					title={ __( "Social appearance", "wordpress-seo" ) }
					initialIsOpen={ true }
				>
					<StyledDescriptionTop>{
						__( "Determine how your post should look on social media like Facebook, Twitter, Instagram, WhatsApp, Threads, LinkedIn, Slack, and more.",
							"wordpress-seo" )
					}</StyledDescriptionTop>
					<FacebookContainer />
					<StyledDescription>
						{ __( "To customize the appearance of your post specifically for Twitter, please fill out " +
							"the 'Twitter appearance' settings below. If you leave these settings untouched, the 'Social appearance' settings " +
							"mentioned above will also be applied for sharing on Twitter.", "wordpress-seo" ) }
					</StyledDescription>
				</MetaboxCollapsible>
				<MetaboxCollapsible
					title={ __( "Twitter appearance", "wordpress-seo" ) }
					// Always preview with separator when Twitter appearance is displayed as a collapsible.
					hasSeparator={ true }
					initialIsOpen={ false }
				>
					<TwitterContainer />
				</MetaboxCollapsible>
			</Fragment> }
			{ ( useOpenGraphData && ! useTwitterData ) &&
				// If Twitter is not enabled, don't display Social appearance as a collapsible.
				<StyledSocialAppearanceMetabox>
					<StyledDescriptionTop>{
						__( "Determine how your post should look on social media like Facebook, Twitter, Instagram, WhatsApp, Threads, LinkedIn, Slack, and more.",
							"wordpress-seo" )
					}</StyledDescriptionTop>
					<FacebookContainer />
				</StyledSocialAppearanceMetabox>
			}
			{ ( ! useOpenGraphData && useTwitterData ) &&
				// If Open Graph is not enabled, don't display Twitter appearance as a collapsible.
				<StyledSocialAppearanceMetabox>
					<StyledDescriptionTop>
						{ __( "To customize the appearance of your post specifically for Twitter, please fill out " +
						"the 'Twitter appearance' settings below.", "wordpress-seo" ) }
					</StyledDescriptionTop>
					<TwitterContainer />
				</StyledSocialAppearanceMetabox>
			}
		</Fragment>
	);
};

SocialMetadata.propTypes = {
	useOpenGraphData: PropTypes.bool.isRequired,
	useTwitterData: PropTypes.bool.isRequired,
};

export default SocialMetadata;
