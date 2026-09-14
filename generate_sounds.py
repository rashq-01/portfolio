import wave
import struct
import math
import random

def generate_wav(filename, duration, sample_rate, generate_sample):
    with wave.open(filename, 'w') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(sample_rate)
        num_samples = int(duration * sample_rate)
        
        for i in range(num_samples):
            t = float(i) / sample_rate
            sample = generate_sample(t, num_samples, i)
            # clamp
            sample = max(-1.0, min(1.0, sample))
            value = int(sample * 32767.0)
            f.writeframes(struct.pack('<h', value))

# Generate Tick (short click for terminal)
def tick_sample(t, num_samples, i):
    # Short burst of high frequency, fast decay
    envelope = math.exp(-t * 200)
    freq = 800 - t * 4000
    if freq < 100: freq = 100
    return math.sin(2 * math.pi * freq * t) * envelope * 0.5

generate_wav('public/tick.wav', 0.05, 44100, tick_sample)

# Generate Blast (explosion)
def blast_sample(t, num_samples, i):
    # Noise + low frequency sweep
    noise = random.uniform(-1.0, 1.0)
    
    # Lowpass filter the noise roughly
    global last_noise
    if i == 0: last_noise = 0
    alpha = 0.02 + math.exp(-t * 2) * 0.1 # filter opens then closes
    if alpha > 1.0: alpha = 1.0
    filtered_noise = last_noise + alpha * (noise - last_noise)
    last_noise = filtered_noise
    
    # Bass sweep
    bass_freq = 150 * math.exp(-t * 3)
    bass = math.sin(2 * math.pi * bass_freq * t)
    
    envelope = math.exp(-t * 1.5)
    
    return (filtered_noise * 0.7 + bass * 0.8) * envelope

generate_wav('public/blast.wav', 3.0, 44100, blast_sample)

print("Generated tick.wav and blast.wav in public/")
