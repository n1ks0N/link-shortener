import firebase from 'firebase/app';
import 'firebase/database';
const firebaseConfig = {
	apiKey: 'AIzaSyADJmYhgzMozWTqdQovEWEhI3EHUZJPUg4',
	authDomain: 'banner-redactor.firebaseapp.com',
	databaseURL: 'https://banner-redactor-default-rtdb.firebaseio.com',
	projectId: 'banner-redactor',
	storageBucket: 'banner-redactor.appspot.com',
	messagingSenderId: '1074215455717',
	appId: '1:1074215455717:web:6d45d5ba724feda4ebfd0c',
	measurementId: 'G-DBB3DE4VPV'
};

export const fbDatabase = firebase.initializeApp(firebaseConfig);
