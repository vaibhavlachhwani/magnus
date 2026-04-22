import requests
import time
import statistics
import argparse
import sys

# Configuration
BASE_URL = "http://localhost:8080"
HEALTH_ENDPOINT = f"{BASE_URL}/health"

def run_health_benchmark(num_tests):
    print(f"[*] Starting health check benchmark on {HEALTH_ENDPOINT}")
    print(f"[*] Total iterations: {num_tests}")
    
    times = []
    success_count = 0
    error_count = 0

    for i in range(num_tests):
        try:
            start = time.perf_counter()
            response = requests.get(HEALTH_ENDPOINT, timeout=5)
            end = time.perf_counter()
            
            duration = (end - start) * 1000  # Convert to ms
            
            if response.status_code == 200:
                times.append(duration)
                success_count += 1
            else:
                print(f"[!] Iteration {i+1}: Received unexpected status code {response.status_code}")
                error_count += 1
                
        except requests.exceptions.RequestException as e:
            print(f"[!] Iteration {i+1}: Connection error: {e}")
            error_count += 1

        # Simple progress indicator for large N
        if (i + 1) % 100 == 0:
            print(f"    - Completed {i + 1}/{num_tests} iterations...")

    return times, success_count, error_count

def report(times, success, errors):
    total = success + errors
    print("\n" + "="*65)
    print("HEALTH ENDPOINT ROUNDTRIP BENCHMARK REPORT")
    print("="*65)
    print(f"Target URL:    {HEALTH_ENDPOINT}")
    print(f"Total Probes:  {total}")
    print(f"Successes:     {success}")
    print(f"Failures:      {errors}")
    print("-" * 65)

    if times:
        avg = statistics.mean(times)
        stdev = statistics.stdev(times) if len(times) > 1 else 0
        maximum = max(times)
        minimum = min(times)

        print(f"{'Statistic':<20} | {'Value (ms)':<15}")
        print("-" * 65)
        print(f"{'Average RTT':<20} | {avg:<15.2f}")
        print(f"{'Std Deviation':<20} | {stdev:<15.2f}")
        print(f"{'Maximum':<20} | {maximum:<15.2f}")
        print(f"{'Minimum':<20} | {minimum:<15.2f}")
    else:
        print("[!] No successful data points to report.")

    print("="*65)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Benchmark the RTT of the /health endpoint.")
    parser.add_argument("-n", "--iterations", type=int, default=100, help="Number of iterations to run (default: 100)")
    args = parser.parse_args()

    try:
        # Check if server is up before starting
        requests.get(HEALTH_ENDPOINT, timeout=2)
    except Exception:
        print(f"[!] Critical: Cannot connect to {HEALTH_ENDPOINT}. Is the server running?")
        sys.exit(1)

    t_results, s_count, e_count = run_health_benchmark(args.iterations)
    report(t_results, s_count, e_count)
