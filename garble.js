var CryptoJS = require("crypto-js")


var a1=new Wire();
var a2=new Wire();
var b1=new Wire();
var b2=new Wire();
var ra=new Wire();
var rb=new Wire();
var r=new Wire(3);

var g1=new XorGate(a1,a2,ra);
var g2=new AndGate(b1,b2,rb);
var g3=new XorGate(ra,rb,r);

console.log("g1",g1)
console.log("g2",g2)
console.log("g3",g3)
var lut_g1=g1.getLut();
var lut_g2=g2.getLut();
var lut_g3=g3.getLut();
var in_a1=a1.getValue1();
var in_a2=a2.getValue0();
var in_b1=b1.getValue1();
var in_b2=b2.getValue1();


var gate1=new Gate(lut_g1);
var gate2=new Gate(lut_g2);
var gate3=new Gate(lut_g3);

var r1=gate1.operate(in_a2, in_a1);
var r2=gate2.operate(in_b2, in_b1);
var r3=gate3.operate(r2, r1);

console.log("res",r3,r.getValue0(),r.getValue1())

function Gate(l1,l2,l3,l4){
    this.lut=[];

    if(l1!==null&&l2!==null&&l3!==null&&l4!==null){
        this.lut[0]=l1;
        this.lut[1]=l2;
        this.lut[2]=l3;
        this.lut[3]=l4;
    }else{
        this.lut=lut;
    }

    this.operate=function(key1,key2){
        var result1=null;
        var result2=null;
        for(var i=0;i<4;i++)
        {
            result1=AESdecrypt(this.lut[0][i],key1);
            result2=AESdecrypt(result1,key2);
            result2=result2.split(',')
            for (a in result2 ) {
                result2[a] = parseInt(result2[a], 10); 
            }
console.log("operate->",this.lut[0][i],"res1: ",result1,"res2: ",result2)
            if(result2[0]==0x12&&result2[1]==0x33&&result2[2]==0x21)
                return result2;
        }

        return null;
    }
    this.genEncryptedLut=function(i00,i01,i10,i11,i1,i2,r){
//encrypt
        console.log("enc vlaue1--",r.value[i00].toString(),i1.value[0],i2.value[0])
        console.log("enc vlaue2--",r.value[i01].toString(),i1.value[1],i2.value[0])
        this.lut=[];
        this.lut.push(
            AESencrypt(AESencrypt(r.value[i00].toString(),i1.value[0]),i2.value[0]),
            AESencrypt(AESencrypt(r.value[i01].toString(),i1.value[1]),i2.value[0]),
            AESencrypt(AESencrypt(r.value[i10].toString(),i1.value[0]),i2.value[1]),
            AESencrypt(AESencrypt(r.value[i11].toString(),i1.value[1]),i2.value[1])
        )
console.log("enc",this.lut)
        //shuffle
        if(Math.random() >= 0.5)
            swap(this.lut[0],this.lut[1]);
        if(Math.random() >= 0.5)
            swap(this.lut[2],this.lut[3]);
        if(Math.random() >= 0.5)
            swap(this.lut[0],this.lut[2]);
        if(Math.random() >= 0.5)
            swap(this.lut[1],this.lut[3]);
    }
    this.getLutEntry=function(i)
    {
        return this.lut[i];
    }

    this.getLut=function()
    {
        return this.lut;
    }

}

function XorGate (i1,i2,r){
    Gate.call(this)     // inherit properties
    this.genEncryptedLut(0,1,1,0,i1,i2,r);
}
XorGate.prototype=Object.create(Gate.prototype) // inherit function
XorGate.prototype.constructor=XorGate

function AndGate(i1,i2,r){
    Gate.call(this)
    this.genEncryptedLut(0,0,0,1,i1,i2,r);
}
AndGate.prototype=Object.create(Gate.prototype);
AndGate.prototype.constructor=AndGate;

function Wire(plaintextmask) {

    this.value=[];

    if(plaintextmask==null){


        this.value.push([0x12,0x33,0x21])
        this.value.push([0x12,0x33,0x21])
    }else{
        if((plaintextmask&1)==1)
            this.value[0]=[0x12,0x33,0x21,0,0,0,0,0,0,0,0,0,0,0,0,0];
        if((plaintextmask&2)==2)
            this.value[1]=[0x12,0x33,0x21,1,1,1,1,1,1,1,1,1,1,1,1,1];
    }

    this.getValue0=function ()
    {
        return this.value[0];
    }

    this.getValue1=function()
    {
        return this.value[1];
    }

}

function AESencrypt(message, key) {
    var keyHex = CryptoJS.enc.Utf8.parse(key);
    var encrypted = CryptoJS.AES.encrypt(message, keyHex, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}
function AESdecrypt(ciphertext, key) {
    var keyHex = CryptoJS.enc.Utf8.parse(key);
    // direct decrypt ciphertext
    var decrypted = CryptoJS.AES.decrypt({
        ciphertext: CryptoJS.enc.Base64.parse(ciphertext)
    }, keyHex, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}
function encodeBase32(value) {
    return base32.encode(value)
}
function swap(a,b){
    var c= a;
    a=b;
    b=c;
}
