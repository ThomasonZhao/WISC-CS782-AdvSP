import json
import os
import pandas as pd
import matplotlib.pyplot as plt

# Increase the font size
plt.rcParams.update({'font.size': 12})

# Load data from files
data = []
for filename in ['basic.txt', 'srp.txt', 'opaque.txt']:
    with open(filename, 'r') as f:
        for line in f:
            data.append(json.loads(line))

# Create a DataFrame from the data
df = pd.DataFrame(data)

# Calculate the mean and standard deviation for each type and protocol
grouped = df.groupby(['type', 'protocol'])['time'].agg(['mean', 'std'])
grouped = grouped.reset_index()

# Convert time from seconds to milliseconds
grouped['mean'] *= 1000
grouped['std'] *= 1000

# Create the graph
plt.figure(figsize=(10, 6))
plt.bar(grouped['type'] + ' (' + grouped['protocol'] + ')', grouped['mean'], yerr=grouped['std'])
plt.xlabel('Function and Protocol')
plt.ylabel('Time (milliseconds)')
plt.title('Performance Test Results')
plt.xticks(rotation=90)
plt.tight_layout()
plt.savefig('performance_test.png')