import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

type Props = {
    onNavigate?: (path: string) => void
}

const Navbar: React.FC<Props> = ({ onNavigate = () => { } }) => {
    return (
        <View style={styles.navbar} accessibilityLabel="Main navigation">
            <Text style={styles.logo}>GT</Text>

            <View style={styles.itemsContainer}>
                <TouchableOpacity onPress={() => onNavigate('/dashboard')} style={styles.itemButton}>
                    <Text style={styles.item}>Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onNavigate('/apps')} style={styles.itemButton}>
                    <Text style={styles.item}>Apps</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onNavigate('/explore')} style={styles.itemButton}>
                    <Text style={styles.item}>Explore</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.loginContainer}>
                <TouchableOpacity onPress={() => onNavigate('/login')} style={styles.itemButton}>
                    <Text style={styles.item}>Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    navbar: {
        width: 100,
        backgroundColor: '#141414',
        paddingTop: 20,
        paddingBottom: 20,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    logo: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '700'
    },
    itemsContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12
    },
    item: {
        color: '#fff',
        fontSize: 12
    },
    itemButton: {
        paddingVertical: 8,
        paddingHorizontal: 6
    },
    loginContainer: {
        marginBottom: 16
    }
})

export default Navbar
