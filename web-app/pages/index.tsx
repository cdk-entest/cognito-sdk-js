import type { NextPage } from 'next'
import SignInForm from '../src/components/signin-form'
import { Profile } from '../src/components/profile'
import { useState } from 'react'
import { SignUpForm } from '../src/components/signup-form'

const Home: NextPage = () => {

  const [auth, setAuth] = useState<any>(null)

  if (auth === 'SIGNUP') {
    return (
      <SignUpForm setUser={setAuth}></SignUpForm>
    )
  }


  if (auth) {
    return <Profile user={auth} setUser={setAuth}></Profile>
  }


  return (
    <SignInForm setUser={setAuth}></SignInForm>
  )
}

export default Home
