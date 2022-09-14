import type { NextPage } from 'next'
import LoginForm from '../src/components/signin-form'
import { Profile } from '../src/components/profile'
import { useState } from 'react'

const Home: NextPage = () => {

  const [auth, setAuth] = useState<any>(null)

  if (auth) {
    return <Profile user={auth}></Profile>
  }

  return (
    <LoginForm setUser={setAuth}></LoginForm>
  )
}

export default Home
