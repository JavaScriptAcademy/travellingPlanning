import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { check } from 'meteor/check';
export const Tasks = new Mongo.Collection('tasks');
export const MapItems = new Mongo.Collection('mapitems');


MapItems.schema = new SimpleSchema({
  lat: { type: [Number] },
  lng: { type: [Number] },
  username:{type: [String]}

});


if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish tasks that are public or belong to the current user
  Meteor.publish('tasks', function tasksPublication() {
    return Tasks.find({
      $or: [
        { private: { $ne: true } },
        { owner: this.userId },
      ],
    });
  });

  Meteor.publish('mapItems',function tasksPublication() {
    return MapItems.find();
  })
}

Meteor.methods({

  'mapitems.insert'(lat,lng,username){
    check(lat,Number);
    check(lng,Number);

     MapItems.insert({ lat: lat, lng: lng, username:username });
  },

  'mapitems.update'(makerId,lat,lng){

      MapItems.update(makerId, { $set: { lat: lat, lng: lng }});
  }

  // 'tasks.remove'(taskId) {
  //   check(taskId, String);

  //   const task = Tasks.findOne(taskId);
  //   if (task.private && task.owner !== Meteor.userId()) {
  //     // If the task is private, make sure only the owner can delete it
  //     throw new Meteor.Error('not-authorized');
  //   }
  //   Tasks.remove(taskId);
  // },
  // 'tasks.setChecked'(taskId, setChecked) {
  //   check(taskId, String);
  //   check(setChecked, Boolean);

  //    const task = Tasks.findOne(taskId);
  //   if (task.private && task.owner !== Meteor.userId()) {
  //     // If the task is private, make sure only the owner can check it off
  //     throw new Meteor.Error('not-authorized');
  //   }

  //   Tasks.update(taskId, { $set: { checked: setChecked } });
  // },
  //  'tasks.setPrivate'(taskId, setToPrivate) {
  //   check(taskId, String);
  //   check(setToPrivate, Boolean);

  //   const task = Tasks.findOne(taskId);

  //   // Make sure only the task owner can make a task private
  //   if (task.owner !== Meteor.userId()) {
  //     throw new Meteor.Error('not-authorized');
  //   }

  //   Tasks.update(taskId, { $set: { private: setToPrivate } });
  // },
});