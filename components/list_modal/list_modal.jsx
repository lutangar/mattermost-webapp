// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';

import ChannelInviteModal from 'components/channel_invite_modal';
import {ModalIdentifiers} from 'utils/constants';

export default class ListModal extends React.PureComponent {
    static propTypes = {
        onHide: PropTypes.func.isRequired,
        titleText: PropTypes.string,
        searchPlaceholderText: PropTypes.string,
        titleButtonText: PropTypes.string,
        titleButtonOnClick: PropTypes.func,
        initialItems: PropTypes.func,
        actions: PropTypes.shape({
            openModal: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            show: true,
            page: 0,
            items: props.initialItems(),
        };
    }

    handleHide = () => {
        this.setState({
            show: false,
        });
    }

    handleExit = () => {
        this.props.onHide();
    }

    renderRows() {
        return this.state.items.map((item, index) => (
            <div
                key={index}
                className='more-modal__row'
            >
                {this.props.renderRow(item)}
            </div>
        ));
    }

    render() {
        return (
            <div>
                <Modal
                    dialogClassName='more-modal more-modal--action'
                    show={this.state.show}
                    onHide={this.handleHide}
                    onExited={this.handleExit}
                >
                    <Modal.Header closeButton={true}>
                        <Modal.Title>
                            <span className='name'>{this.props.titleText}</span>
                        </Modal.Title>
                        {this.props.titleButtonText && this.props.titleButtonOnClick &&
                            <a
                                id='showInviteModal'
                                className='btn btn-md btn-primary'
                                href='#'
                                onClick={this.props.titleButtonOnClick}
                            >
                                {this.props.titleButtonText}
                            </a>}
                    </Modal.Header>
                    <Modal.Body>
                        <div className='filtered-user-list'>
                            <div className='filter-row'>
                                <div className='col-xs-12'>
                                    <input
                                        id='searchUsersInput'
                                        className='form-control filter-textbox'
                                        placeholder={this.props.searchPlaceholderText}
                                    />
                                </div>
                                <div className='col-sm-12'>
                                    <span className='member-count pull-left'><span>1 - 5 members of 8 total</span></span>
                                </div>
                            </div>
                            <div className='more-modal__list'>
                                <div>
                                    {this.renderRows()}
                                </div>
                            </div>
                            <div className='filter-controls'>
                                <button className='btn btn-link filter-control filter-control__next'><span>Next</span></button>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
            </div >
        );
    }
}
