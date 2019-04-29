// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {shallow} from 'enzyme';

import AddGroupsToTeamModal from 'components/add_groups_to_team_modal/add_groups_to_team_modal.jsx';

describe('components/AddGroupsToTeamModal', () => {
    const baseActions = {
        getProfilesNotInTeam: jest.fn().mockResolvedValue({data: true}),
    };
    const baseProps = {
        currentTeamId: 'current_team_id',
    };

    test('should match snapshot', () => {
        const getProfilesNotInTeam = jest.fn().mockResolvedValue({data: true});
        const actions = {...baseActions, getProfilesNotInTeam};
        const props = {...baseProps, actions};
        const wrapper = shallow(
            <AddGroupsToTeamModal {...props}/>
        );
        expect(wrapper).toMatchSnapshot();
        expect(wrapper.find(Modal).exists()).toBe(true);
        expect(actions.getProfilesNotInTeam).toHaveBeenCalledTimes(1);
        expect(actions.getProfilesNotInTeam).toHaveBeenCalledWith('current_team_id', 0, 100);
    });
});
