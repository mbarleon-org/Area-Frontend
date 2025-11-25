import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Navbar from '../components/Navbar/Navbar.native'

export default function DashboardScreen() {
    return (
        <View style={styles.wrapper}>
            <Navbar />
            <View style={styles.content}>
                <Text style={styles.title}>Automations (mobile)</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: { flex: 1, flexDirection: 'row', backgroundColor: '#151316' },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    title: { color: '#fff', fontSize: 18 }
})
