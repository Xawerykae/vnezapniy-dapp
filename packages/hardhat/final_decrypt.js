// final_decrypt.js
const { ethers } = require('ethers');

// ВАЖНО: Вся строка должна быть на одной линии, без переносов
const encryptedJsonString = '{"address":"236828d13efe38e35b94df4a6220c95d4aba713d","id":"8220d975-6993-4347-9baf-59d4e6099c7d","version":3,"Crypto":{"cipher":"aes-128-ctr","cipherparams":{"iv":"eb1095eb3574046624fc3b48cc6c2b98"},"ciphertext":"3495fd76ff7bc76dccf87541e796b14db7f587b66c0d56585950fe2e857ccd6c","kdf":"scrypt","kdfparams":{"salt":"4de556c41ec9f253fb14b442739e4d95c8f87083b7ec1593edb373b01692e615","n":131072,"dklen":32,"p":1,"r":8},"mac":"d420f1399b1d66ea32feab981adad9747384d65557370884b892a69b6bbc0998"},"x-ethers":{"client":"ethers/6.13.7","gethFilename":"UTC--2025-12-16T10-52-43.0Z--236828d13efe38e35b94df4a6220c95d4aba713d","path":"m/44\'/60\'/0\'/0/0","locale":"en","mnemonicCounter":"ea8a68f9552c661e0c80e878c590a923","mnemonicCiphertext":"9c68e7f8856d9bca9e4d2dcc15aa427f","version":"0.1"}}';

// ВАШ ПАРОЛЬ ЗДЕСЬ
const password = '123';

async function main() {
  try {
    console.log('Пытаюсь расшифровать...');
    const wallet = await ethers.Wallet.fromEncryptedJson(encryptedJsonString, password);
    console.log('✅ УСПЕХ!');
    console.log('Адрес:', wallet.address);
    console.log('Приватный ключ:', wallet.privateKey);
  } catch (error) {
    console.error('❌ ОШИБКА:', error.message);
  }
}

main();