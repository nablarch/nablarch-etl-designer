'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
    isAny = require('bpmn-js/lib/features/modeling/util/ModelingUtil').isAny;

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

function hasTransitionIncoming(target){

  var incoming = target.incoming;
  if(!incoming){
    return false;
  }

  if(incoming.length === 0){
    return false;
  }

  for(var i = 0; i < incoming.length; i++){
    if(incoming[i].type === 'jsr352:Transition'){
      return true;
    }
  }

  return false;
}

module.exports.hasTransitionIncoming = hasTransitionIncoming;

function hasTransitionOutgoing(source){

  var outgoing = source.outgoing;
  if(!outgoing){
    return false;
  }

  if(outgoing.length === 0){
    return false;
  }

  for(var i = 0; i < outgoing.length; i++){
    if(outgoing[i].type === 'jsr352:Transition'){
      return true;
    }
  }

  return false;
}

module.exports.hasTransitionOutgoing = hasTransitionOutgoing;

function canConnectFromBatchComponent(source, target){
  if(isAny(target, ['jsr352:BatchComponent', 'jsr352:End', 'jsr352:Fail', 'jsr352:Stop'])){
    if(!hasTransitionOutgoing(source) && !hasTransitionIncoming(target)){
      return {type: 'jsr352:Transition'};
    }else{
      return false;
    }
  }else if(is(target, 'jsr352:DataComponent')){
    return {type: 'bpmn:DataOutputAssociation'};
  }else{
    return false;
  }
}

module.exports.canConnectFromBatchComponent = canConnectFromBatchComponent;

function canConnectFromDataComponent(source, target){
  if(is(target, 'jsr352:BatchComponent')){
    return {type: 'bpmn:DataInputAssociation'};
  }else{
    return false;
  }
}

module.exports.canConnectFromDataComponent = canConnectFromDataComponent;

function canConnectFromStart(source, target){
  if(is(target, 'jsr352:BatchComponent')){
    if(!hasTransitionOutgoing(source) && !hasTransitionIncoming(target)){
      return {type: 'jsr352:Transition'};
    }else{
      return false;
    }
  }else{
    return false;
  }
}

module.exports.canConnectFromStart = canConnectFromStart;

function canReconnectStart(source, target, connection) {

  if (source == target) {
    return false;
  }

  if (is(connection, 'jsr352:Transition')) {

    if(source && source.id === getBusinessObject(connection).sourceRef.id){
      return {type: 'jsr352:Transition'};
    }

    if (isAny(source, ['jsr352:Start'])) {
      if(isAny(target, ['jsr352:BatchComponent']) && !hasTransitionOutgoing(source)){
        return {type: 'jsr352:Transition'};
      }else{
        return false;
      }

    } else if (isAny(source, ['jsr352:BatchComponent']) && !hasTransitionOutgoing(source)) {
      return {type: 'jsr352:Transition'};
    } else {
      return false;
    }

  } else if (is(connection, 'bpmn:DataInputAssociation')) {
    if (isAny(source, ['jsr352:DataComponent'])) {
      return {type: 'jsr352:DataInputAssociation'};
    } else {
      return false;
    }

  } else if (is(connection, 'bpmn:DataOutputAssociation')) {
    if (isAny(source, ['jsr352:BatchComponent'])) {
      return {type: 'jsr352:DataOutputAssociation'};
    } else {
      return false;
    }

  } else {
    return false;

  }

}

module.exports.canReconnectStart = canReconnectStart;

function canReconnectEnd(source, target, connection) {

  if( source == target ){
    return false;
  }

  if (is(connection, 'jsr352:Transition')) {

    if(target && target.id === getBusinessObject(connection).targetRef.id){
      return {type: 'jsr352:Transition'};
    }

    if (isAny(source, ['jsr352:Start'])) {
      if (isAny(target, ['jsr352:BatchComponent']) && !hasTransitionIncoming(target)) {
        return {type: 'jsr352:Transition'};
      } else {
        return false;
      }

    } else if (isAny(target, ['jsr352:BatchComponent', 'jsr352:End', 'jsr352:Fail', 'jsr352:Stop']) && !hasTransitionIncoming(target)) {
      return {type: 'jsr352:Transition'};
    } else {
      return false;
    }

  } else if (is(connection, 'bpmn:DataInputAssociation')) {
    if (is(target, 'jsr352:BatchComponent')) {
      return {type: 'jsr352:DataInputAssociation'};
    } else {
      return false;
    }

  } else if (is(connection, 'bpmn:DataOutputAssociation')) {
    if (is(target, 'jsr352:DataComponent')) {
      return {type: 'jsr352:DataInputAssociation'};
    } else {
      return false;
    }

  } else {
    return false;

  }

}

module.exports.canReconnectEnd = canReconnectEnd;


