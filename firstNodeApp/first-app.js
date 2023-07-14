// const fs = require('fs');

// fs.writeFileSync('hello.txt', 'Hello NodeJS. I am !!');

const person = {
    name: 'Avnish',
    greet(){
        return 'Hello ' + this.name;
    }
}

const { name } = person;

console.log(name);

const hobbies = ['Cricket'];
const [ hobby1, hobby2 ] = hobbies;
console.log(hobby1, hobby2);