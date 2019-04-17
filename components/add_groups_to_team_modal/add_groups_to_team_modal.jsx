// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';
import {Client4} from 'mattermost-redux/client';

import Constants from 'utils/constants.jsx';
import {displayEntireNameForUser, localizeMessage} from 'utils/utils.jsx';

import MultiSelect from 'components/multiselect/multiselect.jsx';
import ProfilePicture from 'components/profile_picture.jsx';
import AddIcon from 'components/icon/add_icon';

import {Groups} from 'mattermost-redux/constants';

const USERS_PER_PAGE = 50;
const MAX_SELECTABLE_VALUES = 20;

export default class AddGroupsToTeamModal extends React.Component {
    static propTypes = {
        currentTeamName: PropTypes.string.isRequired,
        currentTeamId: PropTypes.string.isRequired,
        searchTerm: PropTypes.string.isRequired,
        users: PropTypes.array.isRequired,
        onHide: PropTypes.func,
        actions: PropTypes.shape({
            getGroupsNotAssociatedToTeam: PropTypes.func.isRequired,
            setModalSearchTerm: PropTypes.func.isRequired,
            searchGroups: PropTypes.func.isRequired,
            linkGroupSyncable: PropTypes.func.isRequired,

            // loadStatusesForProfilesList: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.searchTimeoutId = 0;

        this.state = {
            values: [],
            show: true,
            search: false,
            saving: false,
            addError: null,
            loadingGroups: true,
        };
    }

    componentDidMount() {
        this.props.actions.getGroupsNotAssociatedToTeam(this.props.currentTeamId, 0, USERS_PER_PAGE * 2).then(() => {
            this.setGroupsLoadingState(false);
        });
    }

    UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line camelcase
        if (this.props.searchTerm !== nextProps.searchTerm) {
            clearTimeout(this.searchTimeoutId);

            const searchTerm = nextProps.searchTerm;
            if (searchTerm === '') {
                return;
            }

            this.searchTimeoutId = setTimeout(
                async () => {
                    this.setGroupsLoadingState(true);
                    const {data} = await this.props.actions.searchGroups(searchTerm, {not_in_team_id: this.props.currentTeamId});
                    if (data) {
                        // this.props.actions.loadStatusesForProfilesList(data);
                    }
                    this.setGroupsLoadingState(false);
                },
                Constants.SEARCH_TIMEOUT_MILLISECONDS
            );
        }
    }

    handleHide = () => {
        this.props.actions.setModalSearchTerm('');
        this.setState({show: false});
    }

    handleExit = () => {
        if (this.props.onHide) {
            this.props.onHide();
        }
    }

    handleResponse = (err) => {
        let addError = null;
        if (err && err.message) {
            addError = err.message;
        }

        this.setState({
            saving: false,
            addError,
        });
    }

    handleSubmit = async (e) => {
        if (e) {
            e.preventDefault();
        }

        const groupIDs = this.state.values.map((v) => v.id);
        if (groupIDs.length === 0) {
            return;
        }

        this.setState({saving: true});

        groupIDs.forEach(async (groupID) => {
            const {error} = await this.props.actions.linkGroupSyncable(groupID, this.props.currentTeamId, Groups.SYNCABLE_TYPE_TEAM, {auto_add: true});
            this.handleResponse(error);
            if (!error) {
                this.handleHide();
            }
        })
    }

    addValue = (value) => {
        const values = Object.assign([], this.state.values);
        const userIds = values.map((v) => v.id);
        if (value && value.id && userIds.indexOf(value.id) === -1) {
            values.push(value);
        }

        this.setState({values});
    }

    setGroupsLoadingState = (loadingState) => {
        this.setState({
            loadingGroups: loadingState,
        });
    }

    handlePageChange = (page, prevPage) => {
        if (page > prevPage) {
            this.setGroupsLoadingState(true);
            this.props.actions.getGroupsNotAssociatedToTeam(this.props.currentTeamId, page + 1, USERS_PER_PAGE).then(() => {
                this.setGroupsLoadingState(false);
            });
        }
    }

    handleDelete = (values) => {
        this.setState({values});
    }

    search = (term) => {
        this.props.actions.setModalSearchTerm(term);
    }

    renderOption(option, isSelected, onAdd) {
        var rowSelected = '';
        if (isSelected) {
            rowSelected = 'more-modal__row--selected';
        }

        return (
            <div
                key={option.id}
                ref={isSelected ? 'selected' : option.id}
                className={'more-modal__row clickable ' + rowSelected}
                onClick={() => onAdd(option)}
            >
                <ProfilePicture
                    src={Client4.getProfilePictureUrl(option.id, option.last_picture_update)}
                    width='32'
                    height='32'
                />
                <div
                    className='more-modal__details'
                >
                    <div className='more-modal__name'>
                        {displayEntireNameForUser(option)}
                    </div>
                    <div className='more-modal__description'>
                        {option.email}
                    </div>
                </div>
                <div className='more-modal__actions'>
                    <div className='more-modal__actions--round'>
                        <AddIcon/>
                    </div>
                </div>
            </div>
        );
    }

    renderValue(props) {
        return props.data.username;
    }

    render() {
        const numRemainingText = (
            <div id='numPeopleRemaining'>
                <FormattedMessage
                    id='multiselect.numPeopleRemaining'
                    defaultMessage='Use ↑↓ to browse, ↵ to select. You can add {num, number} more {num, plural, one {person} other {people}}. '
                    values={{
                        num: MAX_SELECTABLE_VALUES - this.state.values.length,
                    }}
                />
            </div>
        );

        const buttonSubmitText = localizeMessage('multiselect.add', 'Add');
        const buttonSubmitLoadingText = localizeMessage('multiselect.adding', 'Adding...');

        let users = [];
        if (this.props.users) {
            users = this.props.users.filter((user) => user.delete_at === 0);
        }

        let addError = null;
        if (this.state.addError) {
            addError = (<div className='has-error col-sm-12'><label className='control-label font-weight--normal'>{this.state.addError}</label></div>);
        }

        return (
            <Modal
                id='addUsersToTeamModal'
                dialogClassName={'more-modal more-direct-channels'}
                show={this.state.show}
                onHide={this.handleHide}
                onExited={this.handleExit}
            >
                <Modal.Header closeButton={true}>
                    <Modal.Title>
                        <FormattedMessage
                            id='add_groups_to_team.title'
                            defaultMessage='Add New Groups To {teamName} Team'
                            values={{
                                teamName: (
                                    <strong>{this.props.currentTeamName}</strong>
                                ),
                            }}
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {addError}
                    <MultiSelect
                        key='addGroupsToTeamKey'
                        options={users}
                        optionRenderer={this.renderOption}
                        values={this.state.values}
                        valueRenderer={this.renderValue}
                        perPage={USERS_PER_PAGE}
                        handlePageChange={this.handlePageChange}
                        handleInput={this.search}
                        handleDelete={this.handleDelete}
                        handleAdd={this.addValue}
                        handleSubmit={this.handleSubmit}
                        maxValues={MAX_SELECTABLE_VALUES}
                        numRemainingText={numRemainingText}
                        buttonSubmitText={buttonSubmitText}
                        buttonSubmitLoadingText={buttonSubmitLoadingText}
                        saving={this.state.saving}
                        loading={this.state.loadingGroups}
                    />
                </Modal.Body>
            </Modal>
        );
    }
}
