var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  boxSchema = Schema({
    BoxId: String
  }),
  BoxInfo = mongoose.model('boxScheme', boxSchema),
  moteSchema = Schema({
    data: {}
  }),
  MotesData = mongoose.model('moteScheme', moteSchema),
  toSend = {};

//------------- functions START -------------------------------

function callBack(data){
  console.log('Resultado: \n',data);
}

function buildGlobalInfoObj() {

  BoxInfo.findOne({}, function(err, boxInfo) {
    if (!err && boxInfo != null){
      toSend['BoxId'] = boxInfo.BoxId;
    }else{
      console.log('Error: ',err);
    }
    MotesData.find({}, function(err, motesData) {
      if (!err && motesData != null){
        var motesArray = [];
        motesData.forEach(function(item,index){
          motesArray.push(item.data);
        });
        toSend['MoteInfo'] = motesArray;
        callBack(toSend);
      }else{
        console.log('Error: ',err);
      }
    });
  });
};

//------------- functions END   -------------------------------

exports.connectAndBuild = function(){
  mongoose.connect('mongodb://localhost/lastTest', function(err) {
    // if we failed to connect, abort
    if (err) throw err;

    // we connected ok


    BoxInfo.create({
      BoxId:'idDaBox'
    });

    MotesData.create({
      data:{
        moteId:'idDoMote',
        Temperatura:'29',
        Humidade:'34',
        Luminosidade:'450'
      }
    });

    MotesData.create({
      data:{
        moteId:'idDoMote22222',
        Temperatura:'22',
        Luminosidade:'333'
      }
    });

    buildGlobalInfoObj();

  });
}
