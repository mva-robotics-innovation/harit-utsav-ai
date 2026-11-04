"""Create real neural Indian-female voice clips for the Diwali greeting (needs internet).
   pip install edge-tts      then      python tools/make_voice.py
Writes assets/audio/greet1..4.mp3 (played as each logo / name lights up). Edit LINES to change the words.
Voices: en-IN-NeerjaNeural (Indian English, female), hi-IN-SwaraNeural (Hindi, female).
Generated with Microsoft's online neural voices via the edge-tts package: check Microsoft's terms before commercial use,
or swap in another licensed TTS / a recorded voice by saving files with the same names."""
import asyncio, os
import edge_tts
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'audio')
LINES = [
 ('hi-IN-SwaraNeural', 'हैप्पी दिवाली! शुभ दीपावली!'),
 ('en-IN-NeerjaNeural', 'Jharkhand Rai University, Ranchi.'),
 ('en-IN-NeerjaNeural', 'MVA Robotics Innovation Org.'),
 ('en-IN-NeerjaNeural', 'Wishing you a very Happy Diwali, from Ashish Kumar and Hephzibah Toppo.'),
]
async def main():
    for i, (voice, text) in enumerate(LINES, 1):
        p = os.path.join(OUT, f'greet{i}.mp3')
        await edge_tts.Communicate(text, voice, rate='-8%').save(p)
        print('wrote', p, '<-', voice)
asyncio.run(main())
