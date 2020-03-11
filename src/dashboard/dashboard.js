import React from 'react';
import ChatListComponenet from '../chatList/chatList';
import { Button, withStyles } from '@material-ui/core';
import styles from './styles';
import ChatViewComponent from '../chatView/chatView';
import ChatTextBoxComponent from '../chatTextBox/chatTextBox';
import NewChatComponent from '../newChat/newChat'

const firebase = require('firebase');


class DashboardComponenet extends React.Component {

    constructor() {
        super();
        this.state = {
            selectedChat: null,
            newChatFormVisible: false,
            email: null,
            chats: []
        };
    }

    render() {

        const { classes } = this.props;

        return (
            <div>
                <ChatListComponenet history={this.props.history}
                    newChatBtnFn={this.newChatBtnClick}
                    selectChatFn={this.selectChat}
                    chats={this.state.chats}
                    userEmail={this.state.email}
                    selectedChatIndex={this.state.selectedChat}>
                </ChatListComponenet>
                {
                    this.state.newChatFormVisible ?
                        null : <ChatViewComponent user={this.state.email} chat={this.state.chats[this.state.selectedChat]}></ChatViewComponent>
                }
                {
                    this.state.selectedChat !== null && !this.state.newChatFormVisible ?
                        <ChatTextBoxComponent messageReadFn={this.messageRead} submitMessageFn={this.submitMessage}></ChatTextBoxComponent> : null
                }
                {
                    this.state.newChatFormVisible ? <NewChatComponent gotToChatFn={this.goToChat} newChatSubmitFn={this.newChatSubmit}></NewChatComponent> : null
                }
                <Button className={classes.signOutBtn} onClick={this.signOut}>Sign Out</Button>
            </div>
        )
    }

    signOut = () => firebase.auth().signOut();

    selectChat = async (chatIndex) => {
        await this.setState({ selectedChat: chatIndex });
        this.messageRead();
    }

    submitMessage = (msg) => {
        const docKey = this.buildDocKey(this.state.chats[this.state.selectedChat].users.filter(_user => _user !== this.state.email)[0]);
        firebase.firestore().collection('chats').doc(docKey).update({
            messages: firebase.firestore.FieldValue.arrayUnion({
                sender: this.state.email,
                message: msg,
                timestamp: Date.now()
            }),
            recieverHasRead: false
        });
    }

    buildDocKey = (friend) => [this.state.email, friend].sort().join(':');

    messageRead = () => {
        const chatIndex = this.state.selectedChat;
        const docKey = this.buildDocKey(this.state.chats[chatIndex].users.filter(_usr => _usr !== this.state.email)[0]);
        console.log(chatIndex);
        if (this.clickedMessageWhereNotSender(chatIndex)) {
            firebase
                .firestore()
                .collection('chats')
                .doc(docKey)
                .update({ recieverHasRead: true });
        } else {
            console.log('Clicked message where the user was the sender');
        }
    }

    goToChat = async (docKey, msg) => {
        const usersInChat = docKey.split(':');
        const chat = this.state.chats.find(_chat => usersInChat.every(_user => _chat.users.includes(_user)));
        this.setState({ newChatFormVisible: false });
        await this.selectChat(this.state.chats.indexOf(chat));
        this.submitMessage(msg);
    }


    newChatSubmit = async (chatObj) => {
        const docKey = this.buildDocKey(chatObj.sendTo);
        await firebase
            .firestore()
            .collection('chats')
            .doc(docKey)
            .set({
                messages: [{
                    message: chatObj.message,
                    sender: this.state.email
                }],
                users: [this.state.email, chatObj.sendTo],
                receiverHasRead: false
            })
        this.setState({ newChatFormVisible: false });
        this.selectChat(this.state.chats.length - 1);
    }


    newChatBtnClick = () => this.setState({ newChatFormVisible: true, selectedChat: null })

    clickedMessageWhereNotSender = (chatIndex) => this.state.chats[chatIndex].messages[this.state.chats[chatIndex].messages.length - 1].sender !== this.state.email;


    componentDidMount = () => {
        firebase.auth().onAuthStateChanged(async _usr => {
            if (!_usr)
                this.props.history.push('/login');
            else {
                await firebase.firestore()
                    .collection('chats')
                    .where('users', 'array-contains', _usr.email)
                    .onSnapshot(async res => {
                        const chats = res.docs.map(_doc => _doc.data());
                        await this.setState({
                            email: _usr.email,
                            chats: chats
                        });
                    })
            }
        })
    }


}

export default withStyles(styles)(DashboardComponenet);