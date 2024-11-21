import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo'
import {  Slot, useRouter, useSegments } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { useEffect } from 'react'


export default function RootLayout() {
  const tokenCache = {
    async getToken(key: string) {
      try {
        const item = await SecureStore.getItemAsync(key)
        if (item) {
          console.log(`${key} was used 🔐 \n`)
        } else {
          console.log('No values stored under key: ' + key)
        }
        return item
      } catch (error) {
        console.error('SecureStore get item error: ', error)
        await SecureStore.deleteItemAsync(key)
        return null
      }
    },
    async saveToken(key: string, value: string) {
      try {
        return SecureStore.setItemAsync(key, value)
      } catch (err) {
        return
      }
    },
  }

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

  if (!publishableKey) {
    throw new Error('Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env')
  }
  const InitialLayout =() =>{
    const {isLoaded, isSignedIn}=useAuth()
    const segments = useSegments();
    const router = useRouter();
   
    useEffect(()=> {
      if(!isLoaded) return;

      console.log("User: ", isSignedIn)
      const inAuthGroup = segments[0] ==="(auth)"
      if(isSignedIn && !inAuthGroup){
        router.replace("/home")
      }else if (!isSignedIn){
        router.replace("/login")
      }
    },[isSignedIn])
    return <Slot/>
  }
  
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <InitialLayout/>
    </ClerkProvider>
  )
}