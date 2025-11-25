import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import Home from '@area/ui/screens/Home.native'
import Dashboard from '@area/ui/screens/Dashboard.native'
import Apps from '@area/ui/screens/Apps.native'
import Explore from '@area/ui/screens/Explore.native'
import Login from '@area/ui/screens/Login.native'
import Automations from '@area/ui/screens/Automations.native'

const Stack = createNativeStackNavigator()

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="Dashboard" component={Dashboard} />
                <Stack.Screen name="Apps" component={Apps} />
                <Stack.Screen name="Explore" component={Explore} />
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Automations" component={Automations} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}
