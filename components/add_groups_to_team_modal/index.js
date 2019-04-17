// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getGroupsNotAssociatedToTeam, searchGroups} from 'mattermost-redux/actions/groups';
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {searchProfilesNotInCurrentTeam, getProfilesNotInCurrentTeam} from 'mattermost-redux/selectors/entities/users';

// import {loadStatusesForProfilesList} from 'actions/status_actions.jsx';
import {linkGroupSyncable} from 'mattermost-redux/actions/groups';
import {setModalSearchTerm} from 'actions/views/search';

import {ModalIdentifiers} from 'utils/constants';
import {isModalOpen} from 'selectors/views/modals';

import AddGroupsToTeamModal from './add_groups_to_team_modal';

function mapStateToProps(state) {
    const searchTerm = state.views.search.modalSearch;

    let users;
    if (searchTerm) {
        users = searchProfilesNotInCurrentTeam(state, searchTerm, true);
    } else {
        users = getProfilesNotInCurrentTeam(state);
    }

    const team = getCurrentTeam(state) || {};
    const modalId = ModalIdentifiers.ADD_USER_TO_TEAM;

    return {
        currentTeamName: team.display_name,
        currentTeamId: team.id,
        searchTerm,
        users,
        show: isModalOpen(state, modalId),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getGroupsNotAssociatedToTeam,
            setModalSearchTerm,
            searchGroups,
            linkGroupSyncable,

            // loadStatusesForProfilesList,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddGroupsToTeamModal);
