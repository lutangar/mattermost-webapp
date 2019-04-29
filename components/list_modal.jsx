// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import LoadingScreen from 'components/loading_screen.jsx';

export const DEFAULT_NUM_PER_PAGE = 50;

export default class ListModal extends React.PureComponent {
    static propTypes = {
        onHide: PropTypes.func,
        renderRow: PropTypes.func,
        titleText: PropTypes.string,
        searchPlaceholderText: PropTypes.string,
        titleButtonText: PropTypes.string,
        titleButtonOnClick: PropTypes.func,
        initialItems: PropTypes.func,
        onPageChange: PropTypes.func,
        numPerPage: PropTypes.number,
        rangeCountTranslation: PropTypes.func,
        itemKey: PropTypes.string,
        onSearchInput: PropTypes.func,
    }

    constructor(props) {
        super(props);

        this.numPerPage = props.numPerPage || DEFAULT_NUM_PER_PAGE;

        this.state = {
            show: true,
            page: 0,
            items: [],
            totalCount: 0,
            loading: true,
        };
    }

    rangeCountTranslation() {
        const startCount = (this.state.page * this.numPerPage) + 1;
        const endCount = (startCount + this.state.items.length) - 1;
        const total = this.state.totalCount;
        if (this.state.items.length === 0) {
            return '';
        }
        if (this.props.rangeCountTranslation) {
            return this.props.rangeCountTranslation(startCount, endCount, total);
        }
        return (
            <FormattedMessage
                id='list_modal.paginatorCount'
                defaultMessage='{startCount, number} - {endCount, number} of {total, number} total'
                values={{
                    startCount,
                    endCount,
                    total,
                }}
            />
        );
    }

    async componentDidMount() {
        const {totalCount, items} = await this.props.initialItems();
        this.setState({totalCount, items, loading: false});
    }

    handleHide = () => {
        this.setState({show: false});
    }

    handleExit = () => {
        if (this.props.onHide) {
            this.props.onHide();
        }
    }

    renderRows() {
        if (this.state.loading) {
            return (
                <div>
                    <LoadingScreen
                        position='absolute'
                        key='loading'
                    />
                </div>
            );
        }
        return this.state.items.map((item) => (
            <div
                key={item[this.props.itemKey]}
                className='more-modal__row'
            >
                {this.props.renderRow(item, this.triggerOnPageChange)}
            </div>
        ));
    }

    triggerOnPageChange = async () => {
        const {items} = await this.props.onPageChange(this.setState.page);
        this.setState({items});
    }

    onNext = async () => {
        this.setState({loading: true});
        const nextPage = this.state.page + 1;
        const items = await this.props.onPageChange(nextPage);
        this.setState({page: nextPage, items, loading: false});
    }

    onPrev = async () => {
        this.setState({loading: true});
        const prevPage = this.state.page - 1;
        const items = await this.props.onPageChange(prevPage);
        this.setState({page: prevPage, items, loading: false});
    }

    onSearchInput = async (event) => {
        const {target} = event;
        this.setState({loading: true});
        const result = await this.props.onSearchInput(target.value);
        const {items, totalCount} = result;
        this.setState({loading: false, items, totalCount});
    }

    render() {
        const endCount = ((this.state.page * this.numPerPage) + this.state.items.length);
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
                                        onChange={this.onSearchInput}
                                    />
                                </div>
                                <div className='col-sm-12'>
                                    <span className='member-count pull-left'>
                                        {this.rangeCountTranslation()}
                                    </span>
                                </div>
                            </div>
                            <div className='more-modal__list'>
                                <div>
                                    {this.renderRows()}
                                </div>
                            </div>
                            <div className='filter-controls'>
                                {this.state.page > 0 &&
                                <button
                                    onClick={this.onPrev}
                                    className='btn btn-link filter-control filter-control__prev'
                                >
                                    <FormattedMessage
                                        id='filtered_user_list.prev'
                                        defaultMessage='Previous'
                                    />
                                </button>}
                                {(this.state.items.length >= this.props.numPerPage) && endCount !== this.state.totalCount &&
                                <button
                                    onClick={this.onNext}
                                    className='btn btn-link filter-control filter-control__next'
                                >
                                    <FormattedMessage
                                        id='filtered_user_list.next'
                                        defaultMessage='Next'
                                    />
                                </button>}
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
            </div >
        );
    }
}