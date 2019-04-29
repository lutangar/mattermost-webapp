// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {openModal} from 'actions/views/modals';

import ListModal from './list_modal';

const mapStateToProps = (state, ownProps) => ({});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({openModal}, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ListModal);
