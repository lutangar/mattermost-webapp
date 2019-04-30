// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Groups} from 'mattermost-redux/constants';

import {ModalIdentifiers} from 'utils/constants.jsx';

import ListModal, {DEFAULT_NUM_PER_PAGE} from 'components/list_modal.jsx';

export default class TeamGroupsManageModal extends React.PureComponent {
    static propTypes = {
        team: PropTypes.object.isRequired,
        actions: PropTypes.shape({
            getGroupsAssociatedToTeam: PropTypes.func.isRequired,
            unlinkGroupSyncable: PropTypes.func.isRequired,
            closeModal: PropTypes.func.isRequired,
        }).isRequired,
    };

    loadItems = async (pageNumber, searchTerm) => {
        const {data} = await this.props.actions.getGroupsAssociatedToTeam(this.props.team.id, searchTerm, pageNumber, DEFAULT_NUM_PER_PAGE);
        return {
            items: data.groups,
            totalCount: data.totalGroupCount,
        };
    };

    onClickRemoveGroup = (item, listModal) => this.props.actions.unlinkGroupSyncable(item.id, this.props.team.id, Groups.SYNCABLE_TYPE_TEAM).then(async () => {
        listModal.setState({loading: true});
        const {items} = await listModal.props.loadItems(listModal.setState.page, listModal.state.searchTerm);
        listModal.setState({loading: false, items});
    });

    onSearchInput = async (searchTerm) => {
        const {data} = await this.props.actions.getGroupsAssociatedToTeam(this.props.team.id, searchTerm, 0, DEFAULT_NUM_PER_PAGE);
        return {
            items: data.groups,
            totalCount: data.totalGroupCount,
        };
    };

    onHide = () => {
        this.props.actions.closeModal(ModalIdentifiers.MANAGE_TEAM_GROUPS);
    };

    renderRow = (item, listModal) => {
        return (
            <div
                key={item.id}
                className='more-modal__row'
            >
                <img
                    className='more-modal__image'
                    src='/static/files/73209f482a967f9379602dc6253cf768.png'
                    alt='group picture'
                    width='32'
                    height='32'
                />
                <div className='more-modal__details'>
                    <div className='more-modal__name'>{item.display_name} - <span>
                        <FormattedMessage
                            id='numMembers'
                            defaultMessage='{num, number} {num, plural, one {member} other {members}}'
                            values={{
                                num: item.member_count,
                            }}
                        /></span>
                    </div>
                </div>
                <div className='more-modal__actions'>
                    <button
                        id='removeMember'
                        type='button'
                        className='btn btn-danger btn-message'
                        onClick={() => this.onClickRemoveGroup(item, listModal)}
                    >
                        <FormattedMessage
                            id='group_list_modal.removeGroupButton'
                            defaultMessage='Remove Group'
                        />
                    </button>
                </div>
            </div>
        );
    };

    render() {
        return (
            <ListModal
                titleText={`${this.props.team.display_name} Groups`}
                searchPlaceholderText='Search groups'
                renderRow={this.renderRow}
                loadItems={this.loadItems}
                onSearchInput={this.onSearchInput}
                onHide={this.onHide}
            />
        );
    }
}