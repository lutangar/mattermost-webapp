// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {shallow} from 'enzyme';

import ListModal from './list_modal';

describe('components/ListModal', () => {
    const baseProps = {
        actions: {
            openModal: jest.fn(),
        },
    };

    test('should match snapshot', () => {
        const wrapper = shallow(
            <ListModal {...baseProps}/>
        );

        expect(wrapper).toMatchSnapshot();
    });
});
