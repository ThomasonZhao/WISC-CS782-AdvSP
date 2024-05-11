import matplotlib.pyplot as plt
import pandas as pd

# Load the CPU usage data from the files
basic_df = pd.read_csv("basic_cpu.txt")
srp_df = pd.read_csv("srp_cpu.txt")
opaque_df = pd.read_csv("opaque_cpu.txt")

# Convert the timestamp column to datetime objects
basic_df["Timestamp"] = pd.to_datetime(basic_df["Timestamp"])
srp_df["Timestamp"] = pd.to_datetime(srp_df["Timestamp"])
opaque_df["Timestamp"] = pd.to_datetime(opaque_df["Timestamp"])

# Extract the CPU usage values
basic_cpu_usage = basic_df["CPU Usage (%)"].tolist()
srp_cpu_usage = srp_df["CPU Usage (%)"].tolist()
opaque_cpu_usage = opaque_df["CPU Usage (%)"].tolist()

# Extract the timestamps
basic_timestamps = basic_df["Timestamp"].tolist()
srp_timestamps = srp_df["Timestamp"].tolist()
opaque_timestamps = opaque_df["Timestamp"].tolist()
common_timestamps = [x for x in range(40)]

# Create the line plot
plt.figure(figsize=(12, 6))
plt.plot(common_timestamps, basic_cpu_usage, label="BASIC")
plt.plot(common_timestamps, srp_cpu_usage, label="SRP")
plt.plot(common_timestamps, opaque_cpu_usage, label="OPAQUE")
plt.xlabel("Timestamp")
plt.ylabel("CPU Usage (%)")
plt.title("Comparison of CPU Usage Across Scenarios")
plt.grid()
plt.xticks(rotation=45)
plt.legend()

# Save the plot to a file
plt.savefig("cpu_usage_comparison.png", dpi=300)

print("CPU usage comparison graph saved to 'cpu_usage_comparison.png'.")