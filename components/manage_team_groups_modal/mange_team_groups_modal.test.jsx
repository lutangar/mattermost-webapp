// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';
import {Modal} from 'react-bootstrap';

import ManageTeamGroupsModal from 'components/manage_team_groups_modal/manage_team_groups_modal.jsx';

describe('components/ManageTeamGroupsModal', () => {
    test('should match snapshot', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function

        const wrapper = shallow(
            <ManageTeamGroupsModal
                currentTeam={{display_name: 'display name'}}
                onHide={emptyFunction}
                onLoad={emptyFunction}
                isAdmin={false}
                show={true}
            />
        );

        expect(wrapper).toMatchSnapshot();
    });

    test('should call onHide on Modal\'s onExited', () => {
        function emptyFunction() {} //eslint-disable-line no-empty-function
        const onHide = jest.fn();

        const wrapper = shallow(
            <ManageTeamGroupsModal
                currentTeam={{display_name: 'display name'}}
                onHide={onHide}
                onLoad={emptyFunction}
                isAdmin={false}
                show={true}
            />
        );

        wrapper.find(Modal).first().props().onExited();
        expect(onHide).toHaveBeenCalledTimes(1);
    });
});
