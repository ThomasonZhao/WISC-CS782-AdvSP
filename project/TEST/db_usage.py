### Bar Chart ###

# import matplotlib.pyplot as plt

# # Organize the data into a pandas DataFrame
# data = [
#     {"db": "BASIC", "objects": 10000, "avgObjSize": 208.89, "dataSize": 2088900, "storageSize": 1503232, "indexSize": 167936, "totalSize": 1671168},
#     {"db": "SRP", "objects": 10000, "avgObjSize": 749.89, "dataSize": 7498900, "storageSize": 9789440, "indexSize": 376832, "totalSize": 10166272},
#     {"db": "OPAQUE", "objects": 10001, "avgObjSize": 651.9590040995901, "dataSize": 6520242, "storageSize": 8175616, "indexSize": 409600, "totalSize": 8585216}
# ]

# # Create the bar chart
# plt.figure(figsize=(12, 6))
# x = [data[i]["db"] for i in range(len(data))]
# y1 = [data[i]["dataSize"] for i in range(len(data))]
# y2 = [data[i]["storageSize"] for i in range(len(data))]
# y3 = [data[i]["indexSize"] for i in range(len(data))]
# y4 = [data[i]["totalSize"] for i in range(len(data))]

# plt.bar(x, y1, label="Data Size")
# plt.bar(x, y2, bottom=y1, label="Storage Size")
# plt.bar(x, y3, bottom=[y1[i] + y2[i] for i in range(len(y1))], label="Index Size")
# plt.bar(x, y4, bottom=[y1[i] + y2[i] + y3[i] for i in range(len(y1))], label="Total Size")

# plt.title("Database Usage Metrics for Different Password Exchange Protocols")
# plt.xlabel("Protocol")
# plt.ylabel("Size (bytes)")
# plt.legend()

# # Save the plot as a PNG image
# plt.savefig("database_usage_metrics.png", dpi=300)

### Line Chart ###

# import matplotlib.pyplot as plt

# # Organize the data into a dictionary
# data = [
#     {"db": "BASIC", "objects": 10000, "avgObjSize": 208.89, "dataSize": 2088900, "storageSize": 1503232, "indexSize": 167936, "totalSize": 1671168},
#     {"db": "SRP", "objects": 10000, "avgObjSize": 749.89, "dataSize": 7498900, "storageSize": 9789440, "indexSize": 376832, "totalSize": 10166272},
#     {"db": "OPAQUE", "objects": 10001, "avgObjSize": 651.9590040995901, "dataSize": 6520242, "storageSize": 8175616, "indexSize": 409600, "totalSize": 8585216}
# ]

# # Create the line chart
# plt.figure(figsize=(12, 6))
# plt.plot([d["db"] for d in data], [d["dataSize"] for d in data], marker='o', label="Data Size")
# plt.plot([d["db"] for d in data], [d["storageSize"] for d in data], marker='o', label="Storage Size")
# plt.plot([d["db"] for d in data], [d["indexSize"] for d in data], marker='o', label="Index Size")
# plt.plot([d["db"] for d in data], [d["totalSize"] for d in data], marker='o', label="Total Size")

# plt.title("Database Usage Metrics for Different Password Exchange Protocols")
# plt.xlabel("Protocol")
# plt.ylabel("Size (bytes)")
# plt.legend()

# # Save the plot as a PNG image
# plt.savefig("database_usage_metrics_line.png", dpi=300)

### Radar Chart ###

# import matplotlib.pyplot as plt
# import numpy as np

# # Organize the data into a dictionary
# data = [
#     {"db": "BASIC", "objects": 10000, "avgObjSize": 208.89, "dataSize": 2088900, "storageSize": 1503232, "indexSize": 167936, "totalSize": 1671168},
#     {"db": "SRP", "objects": 10000, "avgObjSize": 749.89, "dataSize": 7498900, "storageSize": 9789440, "indexSize": 376832, "totalSize": 10166272},
#     {"db": "OPAQUE", "objects": 10001, "avgObjSize": 651.9590040995901, "dataSize": 6520242, "storageSize": 8175616, "indexSize": 409600, "totalSize": 8585216}
# ]

# # Create the radar chart
# plt.figure(figsize=(8, 8))
# theta = np.linspace(0, 2 * np.pi, 4, endpoint=False)

# for d in data:
#     values = [d["dataSize"], d["storageSize"], d["indexSize"], d["totalSize"]]
#     ax = plt.subplot(111, polar=True)
#     ax.plot(theta, values, linewidth=2, label=d["db"])
#     ax.fill(theta, values, alpha=0.25)

# ax.set_thetagrids(theta * 180 / np.pi, ["Data Size", "Storage Size", "Index Size", "Total Size"])
# ax.set_title("Database Usage Metrics for Different Password Exchange Protocols")
# ax.legend(loc="lower right")

# # Save the plot as a PNG image
# plt.savefig("database_usage_metrics_radar.png", dpi=300)