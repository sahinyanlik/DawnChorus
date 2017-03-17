import { Platform } from 'react-native';
import NotificationsIOS from 'react-native-notifications';
import PushNotification from 'react-native-push-notification';

import moment from 'moment';

// *** Action Types ***
export const LOAD_NOTIFICATIONS = 'LOAD_NOTIFICATIONS';
export const CLEAR_NOTIFICATIONS = 'CLEAR_NOTIFICATIONS';
export const UPDATE_NOTIFICATION_PERMISSIONS = 'UPDATE_NOTIFICATION_PERMISSIONS';
export const UPDATE_SILENT_SWITCH_STATE = 'UPDATE_SILENT_SWITCH_STATE';

// *** Status Types ***
export const NOTIFICATION_PERMISSIONS_STATUS_AUTHORIZED = 'NOTIFICATION_PERMISSIONS_STATUS_AUTHORIZED';
export const NOTIFICATION_PERMISSIONS_STATUS_DENIED = 'NOTIFICATION_PERMISSIONS_STATUS_DENIED';
export const NOTIFICATION_PERMISSIONS_STATUS_NOTDETERMINED = 'NOTIFICATION_PERMISSIONS_STATUS_NOTDETERMINED';

const tweetyStrings = [
  'starts the chorus',
  'joins the chorus',
  'joins the chorus',
  'joins the chorus',
  'joins the chorus',
  'is singing, wake up!',
  'is singing, wake up!',
  'is singing, wake up!',
  'is singing its heart out',
  'is singing its heart out',
  'is wondering if you\'ll ever wake up!',
  'is wondering if you\'ll ever wake up!',
  'is wondering if you\'ll ever wake up!',
  'is wondering if you\'ll ever wake up!',
  'is wondering if you\'ll ever wake up!',
];

export function clearNotifications(alarm) {
  if (Platform.OS === 'ios') {
    NotificationsIOS.cancelLocalNotification(alarm.uuid.toString());
  } else if (Platform.OS === 'android') {
    PushNotification.cancelLocalNotifications({ alarmUUID: alarm.uuid });
    PushNotification.clearAllNotifications();
  }
  return (Object.assign({}, alarm, { notifications: [] }));
}

function createiOSNotification(bird, index, date, alarm) {
  NotificationsIOS.localNotification({
    alertTitle: 'Dawn Chorus Alarm',
    category: 'ALARM',
    alertBody: `A ${bird.name} ${tweetyStrings[index]}!`,
    alertAction: 'Tap to hear chorus.',
    soundName: bird.sound.iosNotification,
    fireDate: date.toDate().toISOString(),
    userInfo: { alarmUUID: alarm.uuid },
  }, alarm.uuid.toString());

  return;
}

function createAndroidNotification(bird, index, date, alarm) {
  PushNotification.localNotificationSchedule({
    largeIcon: bird.images.face,
    smallIcon: 'ic_notification',
    title: 'Dawn Chorus Alarm',
    alarmUUID: alarm.uuid,
    userInfo: { alarmUUID: alarm.uuid },
    message: `A ${bird.name} ${tweetyStrings[index]}!`,
    subText: 'Tap to hear chorus',
    date: date.toDate(),
    soundName: bird.sound.androidNotification,
    vibrate: false,
    actions: '["Snooze", "Stop"]',
  });

  return;
}

export function scheduleAlarm(alarm) {
  // This function will be called when an alarm is saved, or turned on
  const date = moment();
  date.set('year', moment().year());
  date.set('month', moment().month());
  date.set('date', moment().date());
  date.set('hour', alarm.time.hour);
  date.set('minute', alarm.time.minute);
  date.set('second', 0);
  date.set('millisecond', 0);

  if (date.isAfter(moment()) === false) {
    date.add(1, 'days');
  }

  let secondsSum = 0;
  let notificationCount = 0;
  let chorusIndex = 0;

  while (secondsSum <= 280) {
    const bird = alarm.chorus[chorusIndex];

    if (bird !== null) {
      if (Platform.OS === 'ios') {
        createiOSNotification(bird, notificationCount, date, alarm);
      } else if (Platform.OS === 'android') {
        createAndroidNotification(bird, notificationCount, date, alarm);
      }
    }

    // Add 20 seconds to the next alarm to stagger alarms
    date.add(20, 'seconds');
    secondsSum += 20;

    // Increase notification count
    notificationCount += 1;

    // Increase chorus index, or wrap around and repeat birds.
    chorusIndex += 1;
    if (chorusIndex >= alarm.chorus.length || alarm.chorus[chorusIndex] === null) {
      chorusIndex = 0;
    }
  }

  return;
}

export function scheduleSnoozedAlarm(alarm) {
  const date = moment();
  const snoozeTime = moment();
  snoozeTime.add(10, 'minutes');
  snoozeTime.set('second', 0);
  snoozeTime.set('millisecond', 0);

  date.add(10, 'minutes');
  date.set('second', 0);
  date.set('millisecond', 0);

  let secondsSum = 0;
  let notificationCount = 0;
  let chorusIndex = 0;

  while (secondsSum <= 280) {
    const bird = alarm.chorus[chorusIndex];

    if (bird !== null) {
      if (Platform.OS === 'ios') {
        createiOSNotification(bird, notificationCount, date, alarm);
      } else if (Platform.OS === 'android') {
        createAndroidNotification(bird, notificationCount, date, alarm);
      }
    }

    // Add 20 seconds to the next alarm to stagger alarms
    date.add(20, 'seconds');
    secondsSum += 20;

    // Increase notification count
    notificationCount += 1;

    // Increase chorus index, or wrap around and repeat birds.
    chorusIndex += 1;
    if (chorusIndex >= alarm.chorus.length || alarm.chorus[chorusIndex] === null) {
      chorusIndex = 0;
    }
  }

  return {
    time: {
      actual: snoozeTime,
      hour: snoozeTime.hour(),
      minute: snoozeTime.minute(),
    },
  };
}

export function updateNotificationPermissions(update) {
  return {
    type: UPDATE_NOTIFICATION_PERMISSIONS,
    update,
  };
}

export function updateSilentSwitchState(silent) {
  return {
    type: UPDATE_SILENT_SWITCH_STATE,
    silent,
  };
}
