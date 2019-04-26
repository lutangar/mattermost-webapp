// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {ModalIdentifiers} from 'utils/constants';
import {isModalOpen} from 'selectors/views/modals';

import ManageTeamGroupsModal from './manage_team_groups_modal.jsx';

function mapStateToProps(state) {
    return {
        currentTeam: getCurrentTeam(state),
        show: isModalOpen(state, ModalIdentifiers.MANAGE_TEAM_GROUPS),
    };
}

export default connect(mapStateToProps)(ManageTeamGroupsModal);
