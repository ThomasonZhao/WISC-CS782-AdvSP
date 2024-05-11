import psutil
import time
import datetime

# Set the test duration (in seconds)
test_duration = 20

# Set the sampling interval (in seconds)
sampling_interval = 0.5

# Open the output file
with open("cpu_usage_data.txt", "w") as f:
    # Write the header row
    f.write("Timestamp,CPU Usage (%)\n")

    # Start the test
    start_time = time.time()
    end_time = start_time + test_duration
    mid_time1 = start_time + 5
    mid_time2 = end_time - 5

    while time.time() < end_time:
        if time.time() > mid_time1:
            print("start")
            mid_time1 = end_time
        if time.time() > mid_time2:
            print("end")
            mid_time2 = end_time

        # Get the current CPU usage
        cpu_usage = psutil.cpu_percent(interval=None)

        # Get the current timestamp
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")

        # Write the data to the output file
        f.write(f"{timestamp},{cpu_usage}\n")

        # Wait for the next sampling interval
        time.sleep(sampling_interval)

print("CPU usage data saved to 'cpu_usage_data.txt'.")