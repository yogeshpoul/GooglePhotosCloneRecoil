const zod = require("zod");

const signupBody = zod.object({
  name: zod.string(),
  email: zod.string().email(),
  password: zod.string().min(3, 'Password must be at least 3 characters long')
})
const signinBody = zod.object({
  email: zod.string().email(),
  password: zod.string().min(3, 'Password must be at least 3 characters long')
})

module.exports={
    signupBody,
    signinBody
}