import { View } from 'react-native'
import React from 'react'

const Spacer = ({ size = 16, horizontal = false }) => {
    return (
        <View style={horizontal ? { width: size } : { height: size }}></View>
    )
}

export default Spacer