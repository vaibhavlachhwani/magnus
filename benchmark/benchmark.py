import requests
import os
import time
import random
import uuid
import statistics
import argparse
import sys

# Configuration
BASE_URL = "http://localhost:8080"
FILE_SIZES = [1024 * 100, 1024 * 500, 1024 * 1024]  # 100KB, 500KB, 1MB
TEMP_DATA_DIR = "benchmark_files"

def setup():
    if not os.path.exists(TEMP_DATA_DIR):
        os.makedirs(TEMP_DATA_DIR)
    print(f"[*] Setup: Created {TEMP_DATA_DIR} directory")

def create_student():
    """Registers a dummy student to associate documents with."""
    name = f"Benchmark_Student_{uuid.uuid4().hex[:8]}"
    response = requests.post(f"{BASE_URL}/students/register", json={"name": name})
    response.raise_for_status()
    return response.json()['id']

def generate_synthetic_file(size_bytes, path):
    """Generates a file with random binary data."""
    with open(path, 'wb') as f:
        f.write(os.urandom(size_bytes))
    return path

def corrupt_file(original_path):
    """Creates a copy of the file with one byte modified."""
    with open(original_path, 'rb') as f:
        data = bytearray(f.read())
    
    # Flip a random byte
    if len(data) > 0:
        idx = random.randint(0, len(data) - 1)
        data[idx] = (data[idx] + 1) % 256
    
    corrupted_path = original_path + ".forged"
    with open(corrupted_path, 'wb') as f:
        f.write(data)
    return corrupted_path

def run_benchmark(num_tests):
    results = {}
    all_times = []

    print(f"[*] Starting benchmark on {BASE_URL}")
    print(f"[*] Total iterations per size: {num_tests}")

    for size in FILE_SIZES:
        size_label = f"{size // 1024}KB" if size < 1024*1024 else f"{size // (1024*1024)}MB"
        print(f"\n[+] Testing File Size: {size_label}")
        
        authentic_times = []
        unauthentic_times = []

        # Create a fresh student for this batch
        try:
            student_id = create_student()
        except Exception as e:
            print(f"[!] Critical Error: Could not connect to server or register student: {e}")
            return None, None

        for i in range(num_tests):
            original_file = os.path.join(TEMP_DATA_DIR, f"original_{size_label}_{i}.dat")
            generate_synthetic_file(size, original_file)

            # 1. Upload the original (to establish ground truth in DB)
            try:
                with open(original_file, 'rb') as f:
                    requests.post(
                        f"{BASE_URL}/documents/upload",
                        files={"file": f},
                        data={"studentId": student_id}
                    ).raise_for_status()

                # 2. Measure Authentic Verification
                start = time.perf_counter()
                with open(original_file, 'rb') as f:
                    resp = requests.post(f"{BASE_URL}/verify", files={"file": f})
                end = time.perf_counter()
                
                duration = (end - start) * 1000
                if resp.status_code == 200 and resp.json().get('authentic'):
                    authentic_times.append(duration)
                    all_times.append(duration)
                else:
                    print(f"[!] Error: Authentic file failed: {resp.text}")

                # 3. Measure Unauthentic (Forged) Verification
                forged_file = corrupt_file(original_file)
                start = time.perf_counter()
                with open(forged_file, 'rb') as f:
                    resp = requests.post(f"{BASE_URL}/verify", files={"file": f})
                end = time.perf_counter()
                
                duration = (end - start) * 1000
                # Logic: Forged files should return 404 (Not Found) or authentic: false
                if (resp.status_code == 404 or resp.status_code == 200) and not resp.json().get('authentic'):
                    unauthentic_times.append(duration)
                    all_times.append(duration)
                else:
                    print(f"[!] Error: Forged file passed or returned unexpected status: {resp.status_code}")

                # Cleanup files to save space
                os.remove(original_file)
                os.remove(forged_file)
            except Exception as e:
                print(f"[!] Error during test iteration {i}: {e}")
                if os.path.exists(original_file): os.remove(original_file)
                if os.path.exists(forged_file): os.remove(forged_file)

        results[size_label] = {
            "authentic": authentic_times,
            "unauthentic": unauthentic_times
        }

        combined = authentic_times + unauthentic_times
        if combined:
            avg = statistics.mean(combined)
            stdev = statistics.stdev(combined) if len(combined) > 1 else 0
            print(f"    - Combined Avg: {avg:.2f}ms (SD: {stdev:.2f}ms)")

    return results, all_times

def report(results, all_times):
    print("\n" + "="*85)
    print("DOCUMENT AUTHENTICITY BENCHMARK REPORT")
    print("="*85)
    header = f"{'File Size':<12} | {'Category':<15} | {'Avg (ms)':<10} | {'SD (ms)':<10} | {'Max (ms)':<10} | {'Min (ms)':<10}"
    print(header)
    print("-" * 85)
    for size, data in results.items():
        # Individual Categories
        for cat in ["authentic", "unauthentic"]:
            t = data[cat]
            if not t: continue
            avg = statistics.mean(t)
            stdev = statistics.stdev(t) if len(t) > 1 else 0
            print(f"{size:<12} | {cat:<15} | {avg:<10.2f} | {stdev:<10.2f} | {max(t):<10.2f} | {min(t):<10.2f}")
        
        # Combined per size
        combined_size = data["authentic"] + data["unauthentic"]
        if combined_size:
            avg = statistics.mean(combined_size)
            stdev = statistics.stdev(combined_size) if len(combined_size) > 1 else 0
            print(f"{size:<12} | {'combined':<15} | {avg:<10.2f} | {stdev:<10.2f} | {max(combined_size):<10.2f} | {min(combined_size):<10.2f}")
        print("-" * 85)
    
    if all_times:
        total_avg = statistics.mean(all_times)
        total_sd = statistics.stdev(all_times) if len(all_times) > 1 else 0
        print(f"{'OVERALL TOTAL':<12} | {'combined':<15} | {total_avg:<10.2f} | {total_sd:<10.2f} | {max(all_times):<10.2f} | {min(all_times):<10.2f}")
    
    print("="*85)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run Magnus Document Authenticity Benchmark")
    parser.add_argument("-n", "--num-files", type=int, default=20, help="Number of files/iterations per file size (default: 20)")
    args = parser.parse_args()

    setup()
    res, all_t = run_benchmark(args.num_files)
    if res:
        report(res, all_t)
