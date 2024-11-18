# 2S: Visual Data Streaming
2S stands for "Second Screen." This project creates a way for apps on one device to push information to apps on another device using only the screen and a camera.

## How it works
There's two devices at play: a screen you're looking at (Device A), and a camera on another device watching the screen (Device B).

Device A would use this library, encoding data as type of QR code. This heavily modified QR visually encoded data using more colors and shapes, giving more entropy for greater data density. These codes would flash in a standard spot on the screen as new information is pushed.

Device B would scan the screen, reading for our modified QR code. When it detects the code, it decodes back into the payload. Device B can then take action on the data.

## Use case
The most straight-forward way this could be used is as a very low-latency one-way communication bridge between an app playing on a screen and a camera-equipped AR/VR wearable.

Because this works completely visually between the screen and the wearable, you eliminate things like bluetooth, network overhead, the need for AI to run locally to intuit what's happening on screen, and more. It is a direct, visual "wire" from the game to the wearable.

Imagine you're playing a video game through your TV, and imagine you're wearing AR glasses:
- The game could have "AR Mode" which would draw these codes on the screen
- The AR glasses are running a game companion app which scans for the codes on screen
- When found, the glasses render helpful tips or other visual help to the user

A complete example could be with Diablo 4. As you play this on your PS5 and enter "AR Mode," it begins to draw codes on screen to convey player health, mana, skills and cooldowns, and more. The glasses then give visual feedback on things like low health, tinting the screen red. Other examples:
- Visual feedback on what skill to cast when appropriate
- With a map marker active, some subtle visual feedback on which direction to travel
- Configurable in-glasses HUD for damage numbers or items to pick up
- Even things like triggering the glasses' vibration at certain big events

Basically, developers can build a companion AR experience that uses any and all features of the wearable, responding in real-time to events in the game. The same would be true for any app, or any website.

## NOTES FOR ME LATER
stuff:
- data to be encoded is assumed to be json, but may work for all data?
- this could be massaged to "compress" the data, like CSS minification
- if data can be binary, we could gzip? or brotli? whatever compresses JSON the best?
- i am not great at bits and bytes and multibytes, need sanity check
- this (currently) produces a simple 1d matrix to then be decoded or rendered
- it's GOING to be based off aztec (central bullseye), that part isn't done yet
- error correction not implemented yet
- need to ensure the resulting image is actually smaller than what would be normal out of aztec/qr/etc

stuff for streaming:
- multiplexing? raptor codes? i dunno man
- need to figure out sequencing, repeating frames, etc
- unless we can fit a whole payload into one screen