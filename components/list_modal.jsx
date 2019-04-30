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

        /**
         * loadItems is a function that receives the params (pageNumber, searchTerm) and should return an object
         * with the shape {items: [], totalCount: 0}.
         * items: an array of objects that are passed to each renderRow function.
         * totalCount: an integer representing the total number of items as displayed in the pagination text.
         *
         * Example:
         *     const loadItems = async (pageNumber, searchTerm) => {
         *         const {data} = await loadFromServer(searchTerm, pageNumber, PER_PAGE);
         *         return {
         *             items: data.users,
         *             totalCount: data.total,
         *         };
         *     };
         */
        loadItems: PropTypes.func.isRequired,

        /**
         * renderRow is a function that receives the params (item, listModal) and should return JSX.
         * item: an object as returned by each entry in the loadItems function's 'items' array.
         * listModal: the instance of the ListModal component class.
         *
         * Example:
         *     const renderRow = (item, listModal) => <div>{item.id}</div>;
         */
        renderRow: PropTypes.func.isRequired,

        /**
         * onHide (optional) a function to be invoked when the modal is closed.
         */
        onHide: PropTypes.func,

        /**
         * titleText (optional) a string to show at the top bar of the modal.
         */
        titleText: PropTypes.string,

        /**
         * searchPlaceholderText (optional) a string to show as a placeholder in the search input.
         */
        searchPlaceholderText: PropTypes.string,

        /**
         * titleButtonText (optional) a string to show as a text of the title button. If no text is provided
         * no button will be displayed in the modal.
         */
        titleButtonText: PropTypes.string,

        /**
         * titleButtonOnClick (optional) a function to invoke when the title button is clicked. If no function is
         * provided no button will be displayed in the modal.
         */
        titleButtonOnClick: PropTypes.func,

        /**
         * numPerPage (optional) a number setting how many items per page should be displayed. Defaults to
         * DEFAULT_NUM_PER_PAGE.
         */
        numPerPage: PropTypes.number,

        /**
         * numPerPage (optional) a string to use for the paginator range translation. Defaults to the translation used
         * under the key 'list_modal.paginatorCount'.
         */
        rangeCountTranslation: PropTypes.func,
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
            searchTerm: '',
        };
    }

    rangeCountTranslation() {
        let startCount = (this.state.page * this.numPerPage) + 1;
        const endCount = (startCount + this.state.items.length) - 1;
        if (endCount === 0) {
            startCount = 0;
        }
        const total = this.state.totalCount;
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

    async componentWillMount() {
        const {totalCount, items} = await this.props.loadItems(0, '');
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
            this.props.renderRow(item, this)
        ));
    }

    onNext = async () => {
        this.setState({loading: true});
        const nextPage = this.state.page + 1;
        const items = await this.props.loadItems(nextPage, this.state.searchTerm);
        this.setState({page: nextPage, items, loading: false});
    }

    onPrev = async () => {
        this.setState({loading: true});
        const prevPage = this.state.page - 1;
        const items = await this.props.loadItems(prevPage, this.state.searchTerm);
        this.setState({page: prevPage, items, loading: false});
    }

    onSearchInput = async (event) => {
        const {target} = event;
        const searchTerm = target.value;
        this.setState({loading: true, searchTerm});
        const result = await this.props.loadItems(0, searchTerm);
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